'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import UserMenu from './user-menu';
import SettingsMenu from './settings-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HelpCircle } from 'lucide-react';

interface HeaderProps {
    title?: string;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    onTitleChange?: (newTitle: string) => void;
}

export default function Header({ title, icon, children, onTitleChange }: HeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title || '');
    const inputRef = useRef<HTMLInputElement>(null);

    // Update editedTitle when title prop changes
    useEffect(() => {
        setEditedTitle(title || '');
    }, [title]);

    // Focus input when entering edit mode
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleDoubleClick = () => {
        if (onTitleChange) {
            setIsEditing(true);
        }
    };

    const handleSubmit = () => {
        const trimmedTitle = editedTitle.trim();
        if (trimmedTitle && trimmedTitle !== title && onTitleChange) {
            onTitleChange(trimmedTitle);
        } else {
            setEditedTitle(title || '');
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        } else if (e.key === 'Escape') {
            setEditedTitle(title || '');
            setIsEditing(false);
        }
    };

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
                        {isEditing ? (
                            <Input
                                ref={inputRef}
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onBlur={handleSubmit}
                                onKeyDown={handleKeyDown}
                                className="h-8 w-48 md:w-64 text-sm md:text-base font-medium"
                            />
                        ) : (
                            <span
                                className={`font-medium text-sm md:text-base text-foreground ${onTitleChange ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                                onDoubleClick={handleDoubleClick}
                                title={onTitleChange ? "Double-click to rename" : undefined}
                            >
                                {title}
                            </span>
                        )}
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
