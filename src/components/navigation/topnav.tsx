'use client'

import React from 'react'
import { ThemeToggle } from '../theme-toggle'
import { MobileNav } from './mobile-nav'
import { Logo } from './logo'
import { Button } from '../ui/button'
import Link from 'next/link'
import { SiGithub } from '@icons-pack/react-simple-icons'
import { ExternalLinkIcon } from 'lucide-react'
import { GithubButton } from '../github-button'
import { EditingControls } from './EditingControls'

export const TopNav = () => {
  const allowEditing = process.env.NODE_ENV === 'development'

  return (
    <header className="bg-color-base border-b-color-base sticky top-0 z-10 flex h-[var(--topnav-height)] w-full border-b py-2">
      <div className="relative mx-auto flex w-full max-w-[var(--site-width)] px-[var(--site-padding-x)] items-center justify-between  lg:gap-8">
        <div className="flex shrink-0 items-center gap-2 md:w-[calc(var(--side-nav-width)-var(--site-padding-x))]">
          <Logo href="/" showText />
        </div>
        <div className="flex gap-2">

          <div className="hidden items-center justify-start gap-2 md:flex">
            {allowEditing && <EditingControls />}
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex flex-1 items-center justify-end gap-2 md:hidden">
          {allowEditing && <EditingControls />}
          <GithubButton />
          <ThemeToggle />
          <MobileNav />
        </nav>
      </div>
    </header>
  )
}
