'use client';

import { EditModeProvider } from '@/contexts/EditModeContext';
import { SaveProvider } from '@/contexts/SaveContext';
import { NavigationProvider } from "@/contexts/NavigationContext";

export function DevModeProviders({ children }: { children: React.ReactNode }) {
  // Use the simpler approach based on environment constants
  // This works in React 19 because it's not using hooks conditionally
  if (process.env.NODE_ENV === 'development') {
    return (
      <EditModeProvider>
        <NavigationProvider>
          <SaveProvider>
            {children}
          </SaveProvider>
        </NavigationProvider>
      </EditModeProvider>
    );
  }
  
  // In production, just return children without these providers
  return <>{children}</>;
} 