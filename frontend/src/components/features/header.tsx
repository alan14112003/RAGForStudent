'use client';

import Link from 'next/link';
import Image from 'next/image';
import UserMenu from './user-menu';
import SettingsMenu from './settings-menu';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface HeaderProps {
  title?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function Header({ title, icon, children }: HeaderProps) {
  return (
    <header className="h-16 px-6 flex items-center justify-between border-b bg-background sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4">
        {/* Logo - Always click to go home */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
           <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              R
           </div>
           <span className="text-xl font-semibold text-foreground tracking-tight hidden sm:block">RAG Student</span>
        </Link>
        
        {/* Notebook Title / Breadcrumb replacement */}
        {title && (
            <div className="flex items-center gap-4">
                <span className="text-muted-foreground/30 text-2xl font-light">/</span>
                <span className="font-medium text-sm md:text-base text-foreground">{title}</span>
            </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Custom Actions Area (Search, specific buttons) */}
        {children}

        {/* Common Tools */}
        <Button variant="ghost" size="icon" className="text-muted-foreground hidden sm:flex">
            <HelpCircle size={20} />
        </Button>
        <SettingsMenu />
        
        {/* User Profile */}
        <UserMenu />
      </div>
    </header>
  );
}
