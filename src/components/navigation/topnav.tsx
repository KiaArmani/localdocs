'use client'

import { ThemeToggle } from '../theme-toggle'
import { MobileNav } from './mobile-nav'
import { Logo } from './logo'
import { Button } from '../ui/button'
import Link from 'next/link'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { ExternalLinkIcon, Edit3Icon, EyeIcon } from 'lucide-react'
import { GithubButton } from '../github-button'
import { useEditMode } from '@/contexts/EditModeContext'

export const TopNav = () => {
  const { isEditing, toggleEditMode } = useEditMode()

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
            <Button variant="outline" size="icon" onClick={toggleEditMode} aria-label={isEditing ? 'Switch to view mode' : 'Switch to edit mode'}>
              {isEditing ? <EyeIcon size={16} /> : <Edit3Icon size={16} />}
            </Button>
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex flex-1 items-center justify-end gap-2 md:hidden">
          <Button variant="outline" size="icon" onClick={toggleEditMode} aria-label={isEditing ? 'Switch to view mode' : 'Switch to edit mode'}>
            {isEditing ? <EyeIcon size={16} /> : <Edit3Icon size={16} />}
          </Button>
          <GithubButton />
          <ThemeToggle />
          <MobileNav />
        </nav>
      </div>
    </header>
  )
}
