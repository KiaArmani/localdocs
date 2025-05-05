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
// Import Select components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DialogPortal } from '@radix-ui/react-dialog'

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

  // Handle Create Page logic - Use parentPath
  const handleCreatePage = async () => {
    const pageSlug = slugify(newPageTitle)
    if (!newPageTitle || !pageSlug) {
        setCreateError("Title cannot be empty and must generate a valid slug segment.")
        return
    }
    const apiParentPath = selectedParentPath === "__root__" ? "" : selectedParentPath;

    setIsCreating(true)
    setCreateError(null)

    try {
        const response = await fetch('/api/docs/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newPageTitle, parentPath: apiParentPath }),
        })

        const result = await response.json()

        if (!response.ok) {
            throw new Error(result.message || `API Error: ${response.status}`)
        }

        // Success!
        setNewPageTitle('') // Reset form
        setSelectedParentPath("__root__") // Reset parent path to root
        setIsNewPageModalOpen(false)
        window.location.href = result.path

    } catch (error: any) {
        console.error("Failed to create page:", error)
        setCreateError(error.message || "An unexpected error occurred.")
    } finally {
        setIsCreating(false)
    }
  }

  // Generate flattened options for the Select dropdown
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

      {/* Conditionally render modal only in dev mode */} 
      {allowEditing && (
        <Dialog open={isNewPageModalOpen} onOpenChange={setIsNewPageModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              <DialogDescription>
                Enter the title and select the location for your new documentation page.
              </DialogDescription>
            </DialogHeader>
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
                  disabled={isCreating}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parentPathSelect" className="text-right">
                  Location
                </Label>
                <Select
                   value={selectedParentPath}
                   onValueChange={handleParentChange}
                   disabled={isCreating || isNavLoading}
                 >
                   <SelectTrigger className="col-span-3">
                     <SelectValue placeholder={isNavLoading ? "Loading locations..." : "Select parent folder..."} />
                   </SelectTrigger>
                   <DialogPortal>
                     <SelectContent>
                       {parentOptions.map((opt) => (
                         <SelectItem key={opt.value} value={opt.value} style={{ paddingLeft: `${opt.level * 1 + 1}rem` }}>
                           {opt.label}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </DialogPortal>
                 </Select>
              </div>
              {createError && (
                <p className="col-span-4 text-center text-sm text-red-600">{createError}</p>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isCreating}>Cancel</Button>
              </DialogClose>
              <Button type="button" onClick={handleCreatePage} disabled={isCreating || !newPageTitle}>
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Page
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </header>
  )
}
