'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface NotebookMenuProps {
    onRenameClick: () => void;
    onDeleteClick: () => void;
}

export default function NotebookMenu({ onRenameClick, onDeleteClick }: NotebookMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 bg-white/50 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical size={14} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRenameClick(); }}>
                    <Edit2 size={14} className="mr-2" /> Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={(e) => { e.stopPropagation(); onDeleteClick(); }}
                >
                    <Trash2 size={14} className="mr-2" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
