'use client';

import { useEffect, useState } from 'react';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectSource, setHighlightRange, clearUI } from '@/store/features/uiSlice';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chatService';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'react-toastify';
import { useIsMobile } from '@/hooks';
import { MobileTab } from '@/types';
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

    const { selectedSourceId, highlightRange } = useAppSelector((state) => state.ui);

    const [mobileTab, setMobileTab] = useState<MobileTab>('chat');

    // Fetch session data
    const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery({
        queryKey: queryKeys.notebooks.detail(sessionId),
        queryFn: () => chatService.getNotebook(sessionId),
        enabled: !!sessionId,
    });

    // Fetch documents
    const { data: documents = [], isLoading: documentsLoading } = useQuery({
        queryKey: queryKeys.notebooks.documents(sessionId),
        queryFn: () => chatService.getChatDocuments(sessionId),
        enabled: !!sessionId,
    });

    // Upload document mutation
    const uploadMutation = useMutation({
        mutationFn: (file: File) => chatService.uploadFile(sessionId, file),
    });

    // Delete document mutation
    const deleteMutation = useMutation({
        mutationFn: (documentId: number) => chatService.deleteDocument(sessionId, documentId),
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

    const handleSelectSource = (id: number) => {
        dispatch(selectSource(id));
        if (isMobile) {
            setMobileTab('studio');
        }
    };

    const handleCloseSource = () => {
        dispatch(selectSource(null));
        dispatch(setHighlightRange(undefined));
    };

    const handleDeleteSource = async (docId: number) => {
        if (!confirm('Are you sure you want to delete this source? This action cannot be undone.')) return;

        try {
            await deleteMutation.mutateAsync(docId);
            // Update cache
            queryClient.setQueryData(queryKeys.notebooks.documents(sessionId), (old: any[] = []) => {
                return old.filter((d: any) => d.id !== docId);
            });
            if (selectedSourceId === docId) {
                dispatch(selectSource(null));
            }
            toast.success('Source deleted successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to delete source');
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            await uploadMutation.mutateAsync(file);
            // Refetch documents after upload
            queryClient.invalidateQueries({ queryKey: queryKeys.notebooks.documents(sessionId) });
            toast.success('File uploaded and processing...');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Upload failed');
        }
    };

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

    const handleCitationClick = (citation: any) => {
        const foundDoc = documents.find((d: any) => d.filename === citation.sourceName || d.name === citation.sourceName);

        if (foundDoc) {
            dispatch(selectSource(foundDoc.id));
            dispatch(setHighlightRange(citation.highlightRange));
            if (isMobile) {
                setMobileTab('studio');
            }
        } else {
            toast.warning(`Could not find source document: ${citation.sourceName}`);
        }
    };


    const loading = sessionLoading || documentsLoading;
    const uploading = uploadMutation.isPending;

    if (loading) {
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
                    <MobileTabNav activeTab={mobileTab} onTabChange={setMobileTab} />
                    <div className="flex-1 overflow-hidden">
                        {mobileTab === 'sources' && (
                            <SourcesPanel
                                documents={documents}
                                selectedSourceId={selectedSourceId}
                                onSelectSource={handleSelectSource}
                                onDeleteSource={handleDeleteSource}
                                onUpload={handleFileUpload}
                                uploading={uploading}
                            />
                        )}
                        {mobileTab === 'chat' && (
                            <ChatPanel
                                sessionId={sessionId}
                                initialMessages={session.messages || []}
                                onCitationClick={handleCitationClick}
                            />
                        )}
                        {mobileTab === 'studio' && (
                            <StudioPanel
                                documents={documents}
                                selectedSourceId={selectedSourceId}
                                highlightRange={highlightRange}
                                onCloseSource={handleCloseSource}
                            />
                        )}
                    </div>
                </div>
            ) : (
                /* Desktop Layout */
                <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="h-full">
                        <SourcesPanel
                            documents={documents}
                            selectedSourceId={selectedSourceId}
                            onSelectSource={handleSelectSource}
                            onDeleteSource={handleDeleteSource}
                            onUpload={handleFileUpload}
                            uploading={uploading}
                        />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50} minSize={30} className="h-full">
                        <ChatPanel
                            sessionId={sessionId}
                            initialMessages={session.messages || []}
                            onCitationClick={handleCitationClick}
                        />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={30} minSize={20} className="h-full">
                        <StudioPanel
                            documents={documents}
                            selectedSourceId={selectedSourceId}
                            highlightRange={highlightRange}
                            onCloseSource={handleCloseSource}
                        />
                    </ResizablePanel>
                </ResizablePanelGroup>
            )}
        </div>
    );
}
