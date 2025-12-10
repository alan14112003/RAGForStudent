'use client';

import { useEffect } from 'react';
import { Search, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchNotebooks, createNotebook } from '@/store/features/notebooksSlice';
import { toast } from 'react-toastify';
import Header from '@/components/features/Header/Header';
import NotebookItem from './components/NotebookItem';
import CreateNotebookCard from './components/CreateNotebookCard';

export default function Dashboard() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const { notebooks, loading } = useAppSelector((state) => state.notebooks);

    useEffect(() => {
        dispatch(fetchNotebooks());
    }, [dispatch]);

    const handleCreateNotebook = async () => {
        try {
            const result = await dispatch(createNotebook('New Notebook')).unwrap();
            router.push(`/notebook/${result.id}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create notebook');
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

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        <CreateNotebookCard onClick={handleCreateNotebook} />
                        {notebooks.map((nb) => (
                            <NotebookItem
                                key={nb.id}
                                notebook={nb}
                                onClick={() => router.push(`/notebook/${nb.id}`)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

