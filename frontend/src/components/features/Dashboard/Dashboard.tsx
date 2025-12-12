'use client';

import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardPagination from './components/DashboardPagination';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chatService';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'react-toastify';
import Header from '@/components/features/Header/Header';
import NotebookItem from './components/NotebookItem';
import CreateNotebookCard from './components/CreateNotebookCard';
import { Notebook, PaginatedNotebooks } from '@/types';
import { useQueryParams } from '@/hooks';
import { NOTEBOOKS_PAGE_SIZE } from '@/constants';

export default function Dashboard() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const user = useAppSelector((state) => state.auth.user);
    const queryParams = useQueryParams();

    // Get current page from URL, default to 1
    const currentPage = queryParams.getNumber('page', 1);

    // Fetch notebooks using React Query with pagination
    const { data, isLoading } = useQuery<PaginatedNotebooks>({
        queryKey: queryKeys.notebooks.list(currentPage),
        queryFn: () => chatService.getNotebooks(currentPage, NOTEBOOKS_PAGE_SIZE),
    });

    const notebooks = data?.items || [];
    const totalPages = data?.total_pages || 1;
    const total = data?.total || 0;

    // Create notebook mutation
    const createNotebookMutation = useMutation({
        mutationFn: (title: string) => chatService.createNotebook(title),
    });

    const handleCreateNotebook = async () => {
        try {
            const newNotebook = await createNotebookMutation.mutateAsync('New Notebook');
            // Invalidate all notebook list queries
            queryClient.invalidateQueries({ queryKey: queryKeys.notebooks.all });
            toast.success('Notebook created successfully!');
            router.push(`/notebook/${newNotebook.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to create notebook');
        }
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            queryParams.set('page', page);
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

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <CreateNotebookCard onClick={handleCreateNotebook} />
                            {notebooks.map((nb: Notebook) => (
                                <NotebookItem
                                    key={nb.id}
                                    notebook={nb}
                                    onClick={() => router.push(`/notebook/${nb.id}`)}
                                />
                            ))}
                        </div>

                        <DashboardPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={total}
                            itemsShown={notebooks.length}
                            itemName="notebooks"
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </main>
        </div>
    );
}


