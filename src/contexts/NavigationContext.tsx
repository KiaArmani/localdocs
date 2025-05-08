'use client';

import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';

// Define the structure of a navigation node (matching navigation.json)
export interface NavigationNode {
  type: 'category' | 'folder' | 'link';
  name: string;
  href?: string;
  children?: NavigationNode[];
}

interface NavigationContextType {
  navigation: NavigationNode[];
  isLoading: boolean;
  error: string | null;
  updateNavigationNodeName: (href: string, newName: string) => void;
  saveNavigation: () => Promise<void>; // Make save async
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
}

// Recursive helper to update node name by href
const findAndUpdateNodeName = (nodes: NavigationNode[], href: string, newName: string): NavigationNode[] => {
    return nodes.map(node => {
        if (node.type === 'link' && node.href === href) {
            return { ...node, name: newName };
        }
        if (node.children) {
            return { ...node, children: findAndUpdateNodeName(node.children, href, newName) };
        }
        return node;
    });
};

export const NavigationProvider = ({ children }: NavigationProviderProps) => {
  const [navigation, setNavigation] = useState<NavigationNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial navigation data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/navigation/load');
        if (!response.ok) {
          throw new Error(`Failed to load navigation: ${response.statusText}`);
        }
        const data = await response.json();
        setNavigation(data || []);
      } catch (err: any) {
        console.error("NavigationContext Error loading data:", err);
        setError(err.message || "Error loading navigation data.");
        setNavigation([]); // Set empty on error
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Function to update a node's name in the state
  const updateNavigationNodeName = useCallback((href: string, newName: string) => {
    setNavigation(currentNav => findAndUpdateNodeName(currentNav, href, newName));
  }, []);

  // Function to save the current navigation state via API
  const saveNavigation = useCallback(async () => {
    // Prevent saving if navigation is empty (e.g., due to load error)
    if (!navigation || navigation.length === 0) {
      console.warn("NavigationContext: Attempted to save empty navigation. Aborting save.");
      // Optionally, throw an error or set a specific error state
      // throw new Error("Cannot save empty navigation."); 
      return; // Do not proceed with saving an empty navigation
    }

    // Consider adding status states (saving, saved, error) here if needed
    try {
      const response = await fetch('/api/navigation/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(navigation, null, 2), // Send current state
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to save navigation.');
      }
      // Optionally: add success feedback
      console.log("Navigation saved successfully.");
    } catch (err: any) {
      console.error("NavigationContext Error saving data:", err);
      setError(err.message || "Error saving navigation data.");
      // Rethrow or handle error state for UI feedback
      throw err; // Propagate error for SaveContext to handle
    }
  }, [navigation]);

  const value = {
    navigation,
    isLoading,
    error,
    updateNavigationNodeName,
    saveNavigation,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}; 