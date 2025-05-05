'use client'

import React from 'react'
import { ThemeToggle } from '../theme-toggle'
import { MobileNav } from './mobile-nav'
import { Logo } from './logo'
import { Button } from '../ui/button'
import Link from 'next/link'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { ExternalLinkIcon, Edit3Icon, EyeIcon, Save, Check, AlertCircle, Loader2, PlusCircle } from 'lucide-react'
import { GithubButton } from '../github-button'
import { useEditMode } from '@/contexts/EditModeContext'
import { useSaveContext } from '@/contexts/SaveContext'
// Shadcn UI Imports for Modal
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from 'next/navigation'
import { useNavigation, NavigationNode } from '@/contexts/NavigationContext'

// Helper type for flattened navigation options
interface FlattenedNavItem {
    value: string; 
    label: string; 
    level: number;
}

// Recursive helper to flatten navigation structure for Select
const flattenNavForSelect = (nodes: NavigationNode[], prefix = '', level = 0): FlattenedNavItem[] => {
    let options: FlattenedNavItem[] = [];
    nodes.forEach(node => {
        if (node.type === 'category' || node.type === 'folder') {
            const currentPath = prefix ? `${prefix}/${slugify(node.name)}` : slugify(node.name);
            options.push({
                value: currentPath,
                label: `${'.'.repeat(level * 2)} ${node.type === 'category' ? '' : '↳ '}${node.name}`,
                level: level
            });
            if (node.children) {
                options = options.concat(flattenNavForSelect(node.children, currentPath, level + 1));
            }
        }
    });
    return options;
};

// Simple function to generate a URL-safe slug segment from a title (duplicate from API, consider moving to utils)
function slugify(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');
}

export const TopNav = () => {
  const { isEditing, toggleEditMode } = useEditMode()
  const { saveState, triggerSave } = useSaveContext()
  const { navigation, isLoading: isNavLoading, error: navError } = useNavigation(); // Get navigation data
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isNewPageModalOpen, setIsNewPageModalOpen] = React.useState(false)
  // State for the new page form inputs
  const [newPageTitle, setNewPageTitle] = React.useState('')
  const [selectedParentPath, setSelectedParentPath] = React.useState<string>("__root__")
  const [createError, setCreateError] = React.useState<string | null>(null)
  const [isCreating, setIsCreating] = React.useState(false)
  const [modalStep, setModalStep] = React.useState<'title' | 'location' | 'creating' | 'error'>('title')
  const router = useRouter()

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  // Determine if editing features should be enabled
  const allowEditing = process.env.NODE_ENV === 'development';

  // Handle title change - only sets title now
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPageTitle(e.target.value)
    setCreateError(null) // Clear error on input change
  }

  // Handle parent selection change
  const handleParentChange = (value: string) => {
    setSelectedParentPath(value);
    setCreateError(null); // Clear error on input change
  }

  // Handle Create Page logic (now only called from Step 2)
  const handleCreatePage = async () => {
    // Ensure title and slug are valid before proceeding
    const pageSlug = slugify(newPageTitle);
    if (!newPageTitle || !pageSlug) {
        setCreateError("Title cannot be empty and must generate a valid slug segment.");
        setModalStep('error'); // Show error within modal
        return;
    }
    const apiParentPath = selectedParentPath === "__root__" ? "" : selectedParentPath;

    setModalStep('creating'); // Use modalStep for loading state
    setCreateError(null);

    try {
        const response = await fetch('/api/docs/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newPageTitle, parentPath: apiParentPath }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `API Error: ${response.status}`);

        // Success!
        setNewPageTitle('');
        setSelectedParentPath("__root__");
        setModalStep('title'); // Reset step for next time
        setIsNewPageModalOpen(false);
        window.location.href = result.path; // Force reload
    } catch (error: any) {
        console.error("Failed to create page:", error);
        setCreateError(error.message || "An unexpected error occurred.");
        setModalStep('error');
    }
  };

  // Function to handle closing/resetting the modal
  const handleModalClose = (open: boolean) => {
    if (!open) {
        // Reset state when modal closes
        setNewPageTitle('');
        setSelectedParentPath("__root__");
        setCreateError(null);
        setModalStep('title');
    }
    setIsNewPageModalOpen(open);
  };

  // Function to proceed to location selection
  const goToLocationStep = () => {
      if (!newPageTitle) {
          setCreateError("Title cannot be empty.");
          return;
      }
      setCreateError(null);
      setModalStep('location');
  };

  // Generate flattened options for the Location list
  const parentOptions = React.useMemo(() => {
    if (isNavLoading || !navigation) return [];
    const rootOption: FlattenedNavItem = { value: "__root__", label: "(Root Level)", level: -1 }; 
    return [rootOption, ...flattenNavForSelect(navigation)];
  }, [navigation, isNavLoading]);

  const SaveButtonIcon = () => {
    switch (saveState) {
      case 'saving':
        return <Loader2 size={16} className="animate-spin" />
      case 'saved':
        return <Check size={16} />
      case 'error':
        return <AlertCircle size={16} />
      case 'idle':
      default:
        return <Save size={16} />
    }
  }

  return (
    <header className="bg-color-base border-b-color-base sticky top-0 z-10 flex h-[var(--topnav-height)] w-full border-b py-2">
      <div className="relative mx-auto flex w-full max-w-[var(--site-width)] px-[var(--site-padding-x)] items-center justify-between  lg:gap-8">
        <div className="flex shrink-0 items-center gap-2 md:w-[calc(var(--side-nav-width)-var(--site-padding-x))]">
          <Logo href="/" showText />
        </div>
        <div className="flex gap-2">
          <nav className="hidden items-center justify-start gap-2 md:flex">
            <Button variant="navitem" asChild>
              <Link href="https://prose-ui.com">
                Prose UI <ExternalLinkIcon size={16} />
              </Link>
            </Button>
          </nav>

          <div className="hidden items-center justify-start gap-2 md:flex">
            <Button variant="navitem" asChild>
              <Link href="https://github.com/vrepsys/prose-ui-docs-starter">
                <SiGithub size={16} />
                Github
              </Link>
            </Button>
            {/* Conditionally render edit/save controls only in dev mode */}
            {allowEditing && isEditing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={triggerSave}
                disabled={saveState === 'saving'}
                aria-label="Save Document"
                title={saveState === 'error' ? 'Save Failed' : saveState === 'saved' ? 'Saved' : 'Save Document'}
              >
                <SaveButtonIcon />
              </Button>
            )}
            {allowEditing && isEditing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNewPageModalOpen(true)}
                aria-label="Create New Page"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
            )}
            {allowEditing && (
              <Button variant="ghost" size="icon" onClick={toggleEditMode} aria-label={isEditing ? 'Switch to view mode' : 'Switch to edit mode'}>
                {isEditing ? <EyeIcon size={16} /> : <Edit3Icon size={16} />}
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex flex-1 items-center justify-end gap-2 md:hidden">
          {/* Conditionally render mobile edit/save controls only in dev mode */}
           {allowEditing && isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={triggerSave}
              disabled={saveState === 'saving'}
              aria-label="Save Document"
              title={saveState === 'error' ? 'Save Failed' : saveState === 'saved' ? 'Saved' : 'Save Document'}
            >
              <SaveButtonIcon />
            </Button>
          )}
          {allowEditing && (
            <Button variant="ghost" size="icon" onClick={toggleEditMode} aria-label={isEditing ? 'Switch to view mode' : 'Switch to edit mode'}>
              {isEditing ? <EyeIcon size={16} /> : <Edit3Icon size={16} />}
            </Button>
          )}
          <GithubButton />
          <ThemeToggle />
          <MobileNav />
        </nav>
      </div>

      {/* Two-Step New Page Modal Implementation */}
      {allowEditing && (
        <Dialog open={isNewPageModalOpen} onOpenChange={handleModalClose}>
          <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => { if (modalStep === 'creating') e.preventDefault(); }}> {/* Prevent closing while creating */}
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              {modalStep === 'title' && (
                <DialogDescription>Enter the title for your new documentation page.</DialogDescription>
              )}
              {modalStep === 'location' && (
                <DialogDescription>Select the location where this page should be created.</DialogDescription>
              )}
               {modalStep === 'creating' && (
                <DialogDescription>Creating page...</DialogDescription>
              )}
               {modalStep === 'error' && (
                <DialogDescription className="text-red-600">Error creating page.</DialogDescription>
              )}
            </DialogHeader>

            {/* Step 1: Title Input */}
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
                    placeholder="My Awesome Feature"
                  />
                </div>
                {createError && <p className="col-span-4 text-center text-sm text-red-600">{createError}</p>}
              </div>
            )}

            {/* Step 2: Location Selection List */}
            {modalStep === 'location' && (
                 <div className="py-4">
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400"><span className="font-medium">Title:</span> {newPageTitle}</p>
                    <Label className="text-sm font-medium">Select Location:</Label>
                    <div className="mt-2 max-h-60 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700">
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {parentOptions.map((opt) => (
                          <li key={opt.value}>
                            <button
                              type="button"
                              onClick={() => handleParentChange(opt.value)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedParentPath === opt.value ? 'bg-blue-100 dark:bg-blue-900 font-semibold' : ''}`}
                              style={{ paddingLeft: `${opt.level * 1 + 1}rem` }}
                            >
                              {opt.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                 </div>
            )}

            {/* Loading State */}
            {modalStep === 'creating' && (
                <div className="py-4 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            )}

             {/* Error State */}
            {modalStep === 'error' && (
                <div className="py-4 text-center text-red-600"><p>{createError || 'An unknown error occurred.'}</p></div>
            )}

            <DialogFooter>
              {modalStep === 'title' && (
                <>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                    <Button type="button" onClick={goToLocationStep} disabled={!newPageTitle}>Next</Button>
                </>
              )}
              {modalStep === 'location' && (
                 <>
                    <Button type="button" variant="secondary" onClick={() => setModalStep('title')}>Back</Button>
                    <Button type="button" onClick={handleCreatePage}>Create Page</Button>
                 </>
              )}
               {modalStep === 'creating' && (
                    <Button type="button" variant="secondary" disabled>Creating...</Button>
              )}
               {modalStep === 'error' && (
                 <>
                    <Button type="button" variant="secondary" onClick={() => setModalStep('location')}>Back</Button> { /* Go back to location selection on error */}
                    <DialogClose asChild><Button type="button" variant="secondary">Close</Button></DialogClose>
                 </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </header>
  )
}
