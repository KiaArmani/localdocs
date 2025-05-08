'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Edit3Icon, EyeIcon, Save, Check, AlertCircle, Loader2, PlusCircle } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useSaveContext } from '@/contexts/SaveContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/contexts/NavigationContext';
import type { NavigationNode } from '@/contexts/NavigationContext';

// Helper type for flattened navigation options (copied from topnav.tsx)
interface FlattenedNavItem {
    value: string;
    label: string;
    level: number;
}

// Type guard for Error
function isError(e: unknown): e is Error {
    return e instanceof Error;
}

// Recursive helper to flatten navigation structure for Select (copied from topnav.tsx)
const flattenNavForSelect = (nodes: NavigationNode[], prefix = '', level = 0): FlattenedNavItem[] => {
    let options: FlattenedNavItem[] = [];
    for (const node of nodes) {
        if (node.type === 'category' || node.type === 'folder') {
            const currentPath = prefix ? `${prefix}/${slugifyNav(node.name)}` : slugifyNav(node.name);
            options.push({
                value: currentPath,
                label: `${ '.'.repeat(level * 2)}${node.type === 'category' ? '' : '↳ '}${node.name}`,
                level: level
            });
            if (node.children) {
                options = options.concat(flattenNavForSelect(node.children, currentPath, level + 1));
            }
        }
    }
    return options;
};

// Simple function to generate a URL-safe slug segment from a title (copied from topnav.tsx)
// Renamed to avoid potential global scope issues if other slugify exists
function slugifyNav(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
}

export const EditingControls = () => {
  const { isEditing, toggleEditMode } = useEditMode();
  const { saveState, triggerSave } = useSaveContext();
  const { navigation, isLoading: isNavLoading, error: navError } = useNavigation();
  
  const [isNewPageModalOpen, setIsNewPageModalOpen] = React.useState(false);
  const [newPageTitle, setNewPageTitle] = React.useState('');
  const [selectedParentPath, setSelectedParentPath] = React.useState<string>("__root__");
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [isCreating, setIsCreating] = React.useState(false); // Kept for direct usage if any, though modalStep is primary
  const [modalStep, setModalStep] = React.useState<'title' | 'location' | 'creating' | 'error'>('title');
  const router = useRouter(); // Keep if redirects/navigation are needed from here

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPageTitle(e.target.value);
    setCreateError(null);
  };

  const handleParentChange = (value: string) => {
    setSelectedParentPath(value);
    setCreateError(null);
  };

  const handleCreatePage = async () => {
    const pageSlug = slugifyNav(newPageTitle);
    if (!newPageTitle || !pageSlug) {
        setCreateError("Title cannot be empty and must generate a valid slug segment.");
        setModalStep('error');
        return;
    }
    const apiParentPath = selectedParentPath === "__root__" ? "" : selectedParentPath;

    setModalStep('creating');
    setIsCreating(true); // Explicitly set for clarity if used elsewhere
    setCreateError(null);

    try {
        const response = await fetch('/api/docs/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newPageTitle, parentPath: apiParentPath }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `API Error: ${response.status}`);

        setNewPageTitle('');
        setSelectedParentPath("__root__");
        setModalStep('title');
        setIsNewPageModalOpen(false);
        setIsCreating(false);
        // window.location.href = result.path; // Replaced with router.push and router.refresh()
        router.push(result.path);
        router.refresh(); // Important to ensure the new page data is loaded
    } catch (error: unknown) { // Changed to unknown
        console.error("Failed to create page:", error);
        setCreateError(isError(error) ? error.message : "An unexpected error occurred.");
        setModalStep('error');
        setIsCreating(false);
    }
  };

  const handleModalClose = (open: boolean) => {
    if (!open) {
        setNewPageTitle('');
        setSelectedParentPath("__root__");
        setCreateError(null);
        setModalStep('title');
        setIsCreating(false);
    }
    setIsNewPageModalOpen(open);
  };

  const goToLocationStep = () => {
      if (!newPageTitle) {
          setCreateError("Title cannot be empty.");
          return;
      }
      setCreateError(null);
      setModalStep('location');
  };

  const parentOptions = React.useMemo(() => {
    if (isNavLoading || !navigation) return [];
    const rootOption: FlattenedNavItem = { value: "__root__", label: "(Root Level)", level: -1 }; 
    return [rootOption, ...flattenNavForSelect(navigation)];
  }, [navigation, isNavLoading]);

  const SaveButtonIcon = () => {
    switch (saveState) {
      case 'saving': return <Loader2 size={16} className="animate-spin" />;
      case 'saved': return <Check size={16} />;
      case 'error': return <AlertCircle size={16} />;
      default: return <Save size={16} />;
    }
  };

  const handleLocationButtonKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    // Click is already handled by onClick, space/enter are default for button
    // This function could be used if more specific key handling is needed for a div acting as a button
    // For a real button, this might not be strictly necessary unless overriding default behavior.
  };

  return (
    <>
      {/* Desktop Controls */}
      {isEditing && (
        <Button
          variant="ghost"
          size="icon"
          onClick={triggerSave}
          disabled={saveState === 'saving' || saveState === 'saved'}
          aria-label="Save Document"
          title={saveState === 'error' ? 'Save Failed' : saveState === 'saved' ? 'Saved' : 'Save Document'}
        >
          <SaveButtonIcon />
        </Button>
      )}
      {isEditing && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { setIsNewPageModalOpen(true); setModalStep('title');} }
          aria-label="Create New Page"
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
      )}
      <Button variant="ghost" size="icon" onClick={toggleEditMode} aria-label={isEditing ? 'Switch to view mode' : 'Switch to edit mode'}>
        {isEditing ? <EyeIcon size={16} /> : <Edit3Icon size={16} />}
      </Button>

      {/* New Page Modal - Rendered by EditingControls */}
      <Dialog open={isNewPageModalOpen} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {modalStep === 'title' && "Create New Page"}
              {modalStep === 'location' && "Select Location"}
              {modalStep === 'creating' && "Creating Page..."}
              {modalStep === 'error' && "Error"}
            </DialogTitle>
            {modalStep !== 'creating' && modalStep !== 'error' &&  (
              <DialogDescription>
                {modalStep === 'title' && "Enter a title for your new page."}
                {modalStep === 'location' && "Choose where this page should be located in the navigation."}
              </DialogDescription>
            )}
          </DialogHeader>

          {modalStep === 'title' && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPageTitleInput" className="text-right">
                  Title
                </Label>
                <Input
                  id="newPageTitleInput"
                  value={newPageTitle}
                  onChange={handleTitleChange}
                  className="col-span-3"
                  placeholder="My Awesome Page"
                />
              </div>
              {createError && <p className="text-sm text-red-500 col-span-4 text-center">{createError}</p>}
            </div>
          )}

          {modalStep === 'location' && (
             <div className="py-4">
                <Label htmlFor="parentPathSelect">Parent Location</Label>
                {isNavLoading && <p className="text-sm text-muted-foreground">Loading locations...</p>}
                {navError && <p className="text-sm text-red-500">Error loading locations: {isError(navError) ? navError.message : String(navError)}</p>}
                {!isNavLoading && !navError && (
                    <div className="mt-2 max-h-60 overflow-y-auto border rounded-md">
                        {parentOptions.map(option => (
                            <button 
                                type="button"
                                key={option.value} 
                                onClick={() => handleParentChange(option.value)} 
                                className={`w-full text-left p-2 cursor-pointer hover:bg-accent ${selectedParentPath === option.value ? 'bg-accent font-semibold' : ''}`}
                                style={{ paddingLeft: `${10 + option.level * 20}px`}}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
                {createError && <p className="text-sm text-red-500 mt-2 text-center">{createError}</p>}
            </div>
          )}
          
          {modalStep === 'creating' && (
            <div className="flex justify-center items-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="ml-2">Creating your page...</p>
            </div>
          )}

          {modalStep === 'error' && createError && (
            <div className="bg-destructive/10 p-4 rounded-md text-center">
                <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive font-semibold">{createError}</p>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            {modalStep === 'title' && (
                <>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={goToLocationStep} disabled={!newPageTitle || isNavLoading}>
                        Next
                    </Button>
                </>
            )}
            {modalStep === 'location' && (
                 <>
                    <Button type="button" variant="secondary" onClick={() => { setModalStep('title'); setCreateError(null); }}>Back</Button>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleCreatePage} disabled={isCreating || isNavLoading}>
                        {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Page
                    </Button>
                </>
            )}
             {modalStep === 'creating' && ( <Button type="button" variant="secondary" disabled>Please wait...</Button> )}
             {modalStep === 'error' && (
                 <>
                    <Button type="button" variant="secondary" onClick={() => { setModalStep(newPageTitle ? 'location' : 'title'); setCreateError(null); }}>Try Again</Button>
                    <DialogClose asChild>
                         <Button type="button" variant="secondary">Close</Button>
                    </DialogClose>
                </>
             )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}; 