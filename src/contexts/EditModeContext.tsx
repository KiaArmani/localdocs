'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface EditModeContextProps {
  isEditing: boolean;
  toggleEditMode: () => void;
}

const EditModeContext = createContext<EditModeContextProps | undefined>(undefined);

export const EditModeProvider = ({ children }: { children: ReactNode }) => {
  const [isEditing, setIsEditing] = useState(true); // Default to editing mode for now

  const toggleEditMode = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  return (
    <EditModeContext.Provider value={{ isEditing, toggleEditMode }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditMode = (): EditModeContextProps => {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
}; 