'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useRef } from 'react';

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
  // useRef to hold the actual save handler function registered by the editor
  const saveHandlerRef = useRef<() => Promise<void>>(() => Promise.resolve());

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

  const triggerSave = useCallback(() => {
    // Call the currently registered handler
    saveHandlerRef.current();
  }, []);

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