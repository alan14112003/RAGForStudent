'use client';

import { useEffect } from 'react';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { setMobileTab, clearUI } from '@/store/features/uiSlice';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chatService';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'react-toastify';
import { useIsMobile } from '@/hooks';
import Header from '@/components/features/Header/Header';
import SourcesPanel from './components/SourcesPanel';
import StudioPanel from './components/StudioPanel';
import MobileTabNav from './components/MobileTabNav';
import ChatPanel from './components/ChatPanel';

interface NotebookPageProps {
    sessionId: string;
}

export default function NotebookPage({ sessionId }: NotebookPageProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();
    const isMobile = useIsMobile();

    const { mobileTab } = useAppSelector((state) => state.ui);

    // Fetch session data (for header title and loading state)
    const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery({
        queryKey: queryKeys.notebooks.detail(sessionId),
        queryFn: () => chatService.getNotebook(sessionId),
        enabled: !!sessionId,
    });

    // Rename session mutation
    const renameMutation = useMutation({
        mutationFn: (title: string) => chatService.renameNotebook(parseInt(sessionId), title),
    });

    // Clear UI state on unmount
    useEffect(() => {
        return () => {
            dispatch(clearUI());
        };
    }, [dispatch]);

    // Handle session load errors
    useEffect(() => {
        if (sessionError) {
            toast.error('Failed to load notebook');
            router.push('/');
        }
    }, [sessionError, router]);

    const handleTitleChange = async (newTitle: string) => {
        try {
            await renameMutation.mutateAsync(newTitle);
            // Update cache
            queryClient.setQueryData(queryKeys.notebooks.detail(sessionId), (old: any) => {
                return old ? { ...old, title: newTitle } : old;
            });
            toast.success('Notebook renamed successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to rename notebook');
        }
    };

    if (sessionLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-background">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (!session) return null;

    return (
        <div className="h-full flex flex-col bg-background">
            <Header title={session.title} onTitleChange={handleTitleChange}>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Sparkles size={16} className="mr-2" /> Audio Overview
                </Button>
            </Header>

            {/* Mobile Layout */}
            {isMobile ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <MobileTabNav activeTab={mobileTab} onTabChange={(tab) => dispatch(setMobileTab(tab))} />
                    <div className="flex-1 overflow-hidden">
                        {mobileTab === 'sources' && <SourcesPanel />}
                        {mobileTab === 'chat' && <ChatPanel />}
                        {mobileTab === 'studio' && <StudioPanel />}
                    </div>
                </div>
            ) : (
                /* Desktop Layout */
                <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="h-full">
                        <SourcesPanel />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50} minSize={30} className="h-full">
                        <ChatPanel />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={30} minSize={20} className="h-full">
                        <StudioPanel />
                    </ResizablePanel>
                </ResizablePanelGroup>
            )}
        </div>
    );
}
