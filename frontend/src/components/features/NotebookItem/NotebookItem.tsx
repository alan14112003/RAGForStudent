'use client';

import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Book, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Notebook } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NotebookItemProps {
    notebook: Notebook;
    onClick: () => void;
    onRename: (e: React.MouseEvent, notebook: Notebook) => void;
    onDelete: (e: React.MouseEvent, id: number) => void;
}

export default function NotebookItem({
    notebook,
    onClick,
    onRename,
    onDelete,
}: NotebookItemProps) {
    return (
        <Card
            className="group rounded-2xl border-border/40 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden aspect-square bg-card"
            onClick={onClick}
        >
            <div className="h-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 relative p-4 transition-colors">
                <div className="absolute top-1 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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
                            <DropdownMenuItem onClick={(e) => onRename(e, notebook)}>
                                <Edit2 size={14} className="mr-2" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={(e) => onDelete(e, notebook.id)}
                            >
                                <Trash2 size={14} className="mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Book className="text-foreground/5 dark:text-foreground/10 absolute -bottom-6 -right-6 h-28 w-28 transform rotate-12" />
            </div>
            <CardContent className="flex-1 p-4 flex flex-col">
                <CardTitle className="text-base font-semibold line-clamp-2 leading-tight mb-auto group-hover:text-primary transition-colors">
                    {notebook.title}
                </CardTitle>
                <div className="flex items-center justify-between mt-3">
                    <CardDescription className="text-[10px] font-medium bg-muted/50 px-2 py-1 rounded-md">
                        {notebook.source_count} {notebook.source_count === 1 ? 'source' : 'sources'}
                    </CardDescription>
                    <span className="text-[10px] text-muted-foreground">
                        {new Date(notebook.updated_at ? notebook.updated_at : notebook.created_at).toLocaleDateString('vi-VN')}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
