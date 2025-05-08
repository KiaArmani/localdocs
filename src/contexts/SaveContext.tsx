'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useRef } from 'react';
import { useNavigation } from './NavigationContext';

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

interface SaveContextProps {
  saveState: SaveState;
  saveMessage: string;
  triggerSave: () => void;
  registerSaveHandler: (handler: () => Promise<void>) => void;
  setSaveStatus: (state: SaveState, message?: string) => void;
}

const SaveContext = createContext<SaveContextProps | undefined>(undefined);

export const SaveProvider = ({ children }: { children: ReactNode }) => {
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const saveHandlerRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const { saveNavigation } = useNavigation();

  const setSaveStatus = useCallback((state: SaveState, message: string = '') => {
    setSaveState(state);
    setSaveMessage(message);
    // Reset to idle after a delay for saved/error states
    if (state === 'saved' || state === 'error') {
      setTimeout(() => {
        setSaveState('idle');
        setSaveMessage('');
      }, 3000); // Increased delay
    }
  }, []);

  const registerSaveHandler = useCallback((handler: () => Promise<void>) => {
    saveHandlerRef.current = handler;
  }, []);

  const triggerSave = useCallback(async () => {
    if (saveState === 'saving') return; // Prevent double clicks

    setSaveState('saving');
    let mdxSaveError: Error | null = null;
    let navSaveError: Error | null = null;

    try {
        // Trigger the registered handler (saves MDX content)
        await saveHandlerRef.current();
    } catch (error: any) {
        console.error("SaveContext: Error during MDX save:", error);
        mdxSaveError = error;
        // Don't set error status yet, try saving navigation first
    }

    try {
        // Trigger navigation save
        await saveNavigation();
    } catch (error: any) {
        console.error("SaveContext: Error during Navigation save:", error);
        navSaveError = error;
    }

    // Determine final status based on outcomes
    if (mdxSaveError || navSaveError) {
        const errorMessages = [
            mdxSaveError ? `MDX Save Failed: ${mdxSaveError.message}` : null,
            navSaveError ? `Nav Save Failed: ${navSaveError.message}` : null
        ].filter(Boolean).join('; \n');
        setSaveState('error');
        setSaveMessage(errorMessages || 'An unexpected error occurred during save.');
    } else {
        setSaveState('saved');
        setSaveMessage('Document and navigation saved!');
    }
  }, [saveState, setSaveState, saveNavigation]);

  return (
    <SaveContext.Provider value={{ saveState, saveMessage, triggerSave, registerSaveHandler, setSaveStatus }}>
      {children}
    </SaveContext.Provider>
  );
};

export const useSaveContext = (): SaveContextProps => {
  const context = useContext(SaveContext);
  if (context === undefined) {
    throw new Error('useSaveContext must be used within a SaveProvider');
  }
  return context;
}; 