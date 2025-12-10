'use client';

import { useState, useRef, useEffect } from 'react';

interface EditableTitleProps {
    title: string;
    onTitleChange?: (newTitle: string) => void;
}

export default function EditableTitle({ title, onTitleChange }: EditableTitleProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const inputRef = useRef<HTMLInputElement>(null);

    // Update editedTitle when title prop changes
    useEffect(() => {
        setEditedTitle(title);
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
            setEditedTitle(title);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        } else if (e.key === 'Escape') {
            setEditedTitle(title);
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={handleKeyDown}
                className="h-8 w-48 md:w-64 text-sm md:text-base font-medium px-2 rounded border border-input bg-background"
            />
        );
    }

    return (
        <span
            className={`font-medium text-sm md:text-base text-foreground ${onTitleChange ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
            onDoubleClick={handleDoubleClick}
            title={onTitleChange ? "Double-click to rename" : undefined}
        >
            {title}
        </span>
    );
}
