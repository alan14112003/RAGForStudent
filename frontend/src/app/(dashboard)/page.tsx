"use client";

import { useEffect, useState } from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/features/header';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { chatService } from '@/services/chatService';
import { Notebook } from '@/types';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/store';
import NotebookItem from '@/components/features/NotebookItem';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function DashboardPage() {
    const router = useRouter();
    const user = useAppSelector((state) => state.auth.user);
    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotebooks();
    }, []);

    const loadNotebooks = async () => {
        try {
            const data = await chatService.getNotebooks();
            setNotebooks(data);
        } catch (error) {
            console.error("Failed to load notebooks", error);
            // toast.error("Failed to load notebooks"); // Optional: depends on how noisy we want to be
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNotebook = async () => {
        try {
            const newNotebook = await chatService.createNotebook("New Notebook");
            router.push(`/notebook/${newNotebook.id}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to create notebook");
        }
    };

    const handleDeleteClick = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this notebook? This action cannot be undone.")) {
            try {
                await chatService.deleteNotebook(id);
                toast.success("Notebook deleted");
                loadNotebooks();
            } catch (error) {
                console.error("Failed to delete notebook", error);
                toast.error("Failed to delete notebook");
            }
        }
    };

    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [currentNotebook, setCurrentNotebook] = useState<Notebook | null>(null);
    const [newTitle, setNewTitle] = useState("");

    const handleRenameClick = (e: React.MouseEvent, notebook: Notebook) => {
        e.stopPropagation();
        setCurrentNotebook(notebook);
        setNewTitle(notebook.title);
        setIsRenameDialogOpen(true);
    };

    const confirmRename = async () => {
        if (!currentNotebook) return;
        try {
            await chatService.renameNotebook(currentNotebook.id, newTitle);
            toast.success("Notebook renamed");
            setIsRenameDialogOpen(false);
            loadNotebooks();
        } catch (error) {
            console.error("Failed to rename notebook", error);
            toast.error("Failed to rename notebook");
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <Header>
                <div className="hidden md:flex relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9 h-9 bg-muted/30 border-transparent focus:bg-background focus:border-input transition-all" placeholder="Search notebooks..." />
                </div>
            </Header>

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-light text-foreground">Welcome back, {user?.name || 'User'}</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Sort by: </span>
                        <Button variant="ghost" size="sm" className="font-medium text-foreground">Last opened</Button>
                    </div>
                </div>

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
                            <Button onClick={confirmRename}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {/* Create New Card */}
                        <div
                            onClick={handleCreateNotebook}
                            className="group cursor-pointer border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 rounded-2xl flex flex-col items-center justify-center aspect-square hover:bg-primary/5 transition-all duration-300"
                        >
                            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-4">
                                <Plus size={28} />
                            </div>
                            <span className="font-medium text-lg text-foreground/80 group-hover:text-primary transition-colors">New Notebook</span>
                        </div>

                        {/* Existing Notebooks */}
                        {notebooks.map((nb) => (
                            <NotebookItem
                                key={nb.id}
                                notebook={nb}
                                onClick={() => router.push(`/notebook/${nb.id}`)}
                                onRename={handleRenameClick}
                                onDelete={handleDeleteClick}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

