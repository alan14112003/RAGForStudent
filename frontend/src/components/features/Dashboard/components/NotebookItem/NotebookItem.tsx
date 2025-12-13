'use client';

import { useState } from 'react';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Book } from 'lucide-react';
import { Notebook } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chatService';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'react-toastify';
import NotebookMenu from './components/NotebookMenu';

interface NotebookItemProps {
    notebook: Notebook;
    onClick: () => void;
}

export default function NotebookItem({ notebook, onClick }: NotebookItemProps) {
    const queryClient = useQueryClient();
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [newTitle, setNewTitle] = useState(notebook.title);

    // Rename notebook mutation
    const renameMutation = useMutation({
        mutationFn: ({ id, title }: { id: number; title: string }) =>
            chatService.renameNotebook(id, title),
    });

    // Delete notebook mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => chatService.deleteNotebook(id),
    });

    const handleRenameClick = () => {
        setNewTitle(notebook.title);
        setIsRenameDialogOpen(true);
    };

    const handleRenameConfirm = async () => {
        try {
            await renameMutation.mutateAsync({ id: notebook.id, title: newTitle });
            // Update cache
            queryClient.setQueryData<Notebook[]>(queryKeys.notebooks.list(), (old = []) => {
                return old.map(nb =>
                    nb.id === notebook.id ? { ...nb, title: newTitle } : nb
                );
            });
            toast.success('Notebook renamed');
            setIsRenameDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to rename notebook');
        }
    };

    const handleDeleteClick = async () => {
        if (!confirm('Are you sure you want to delete this notebook? This action cannot be undone.')) return;

        try {
            await deleteMutation.mutateAsync(notebook.id);
            // Update cache
            queryClient.setQueryData<Notebook[]>(queryKeys.notebooks.list(), (old = []) => {
                return old.filter(nb => nb.id !== notebook.id);
            });
            toast.success('Notebook deleted');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to delete notebook');
        }
    };

    return (
        <>
            <Card
                className="group rounded-2xl border-border/40 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden aspect-square bg-card"
                onClick={onClick}
            >
                <div className="h-24 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 relative p-4 transition-colors">
                    <div className="absolute top-1 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <NotebookMenu
                            onRenameClick={handleRenameClick}
                            onDeleteClick={handleDeleteClick}
                        />
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

            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Rename Notebook</DialogTitle>
                        <DialogDescription>
                            Enter a new title for your notebook.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="Notebook Title"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleRenameConfirm}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

