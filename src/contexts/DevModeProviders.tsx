'use client';

import React from 'react';
import { EditModeProvider } from '@/contexts/EditModeContext';
import { SaveProvider } from '@/contexts/SaveContext';
import { NavigationProvider } from "@/contexts/NavigationContext";

export function DevModeProviders({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === 'development') {
    return (
      <EditModeProvider>
        <NavigationProvider> {/* Order might matter based on dependencies */}
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