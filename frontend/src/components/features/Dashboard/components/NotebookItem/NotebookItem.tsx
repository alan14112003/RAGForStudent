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
import { useAppDispatch } from '@/store';
import { renameNotebook, deleteNotebook } from '@/store/features/notebooksSlice';
import { toast } from 'react-toastify';
import NotebookMenu from './components/NotebookMenu';

interface NotebookItemProps {
    notebook: Notebook;
    onClick: () => void;
}

export default function NotebookItem({ notebook, onClick }: NotebookItemProps) {
    const dispatch = useAppDispatch();
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [newTitle, setNewTitle] = useState(notebook.title);

    const handleRenameClick = () => {
        setNewTitle(notebook.title);
        setIsRenameDialogOpen(true);
    };

    const handleRenameConfirm = async () => {
        try {
            await dispatch(renameNotebook({ id: notebook.id, title: newTitle })).unwrap();
            toast.success('Notebook renamed');
            setIsRenameDialogOpen(false);
        } catch (error) {
            console.error('Failed to rename notebook', error);
            toast.error('Failed to rename notebook');
        }
    };

    const handleDeleteClick = async () => {
        if (confirm('Are you sure you want to delete this notebook? This action cannot be undone.')) {
            try {
                await dispatch(deleteNotebook(notebook.id)).unwrap();
                toast.success('Notebook deleted');
            } catch (error) {
                console.error('Failed to delete notebook', error);
                toast.error('Failed to delete notebook');
            }
        }
    };

    return (
        <>
            <Card
                className="group rounded-2xl border-border/40 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden aspect-square bg-card"
                onClick={onClick}
            >
                <div className="h-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 relative p-4 transition-colors">
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

