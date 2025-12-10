"use client";

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, Book, MoreVertical, Search, Settings, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/features/header';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { chatService, Notebook } from '@/services/chatService';
import { toast } from 'react-toastify';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit2, Trash2 } from 'lucide-react';
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
                    <h2 className="text-2xl font-light text-foreground">Welcome back, User</h2>
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
                            className="group cursor-pointer border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 rounded-2xl flex flex-col items-center justify-center h-64 hover:bg-primary/5 transition-all duration-300"
                        >
                            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-4">
                                <Plus size={28} />
                            </div>
                            <span className="font-medium text-lg text-foreground/80 group-hover:text-primary transition-colors">New Notebook</span>
                        </div>

                        {/* Existing Notebooks */}
                        {notebooks.map((nb) => (
                            <Card
                                key={nb.id}
                                className="group rounded-2xl border-border/40 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden h-56 bg-card"
                                onClick={() => router.push(`/notebook/${nb.id}`)}
                            >
                                <div className={`h-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 relative p-4 transition-colors`}>
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="secondary" size="icon" className="h-7 w-7 bg-white/50 hover:bg-white dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
                                                    <MoreVertical size={14} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenuItem onClick={(e) => handleRenameClick(e, nb)}>
                                                    <Edit2 size={14} className="mr-2" /> Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => handleDeleteClick(e, nb.id)}>
                                                    <Trash2 size={14} className="mr-2" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <Book className="text-foreground/5 dark:text-foreground/10 absolute -bottom-6 -right-6 h-28 w-28 transform rotate-12" />
                                </div>
                                <CardContent className="flex-1 p-4 flex flex-col">
                                    <CardTitle className="text-base font-semibold line-clamp-2 leading-tight mb-auto group-hover:text-primary transition-colors">{nb.title}</CardTitle>
                                    <div className="flex items-center justify-between mt-3">
                                        <CardDescription className="text-[10px] font-medium bg-muted/50 px-2 py-1 rounded-md">
                                            {nb.source_count} {nb.source_count === 1 ? 'source' : 'sources'}
                                        </CardDescription>
                                        <span className="text-[10px] text-muted-foreground">
                                            {new Date(nb.updated_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

