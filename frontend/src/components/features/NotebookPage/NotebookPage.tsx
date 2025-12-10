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
import {
    fetchSession,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    renameSession,
    selectSource,
    setHighlightRange,
    clearSession,
} from '@/store/features/notebookSessionSlice';
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
    const isMobile = useIsMobile();

    const {
        session,
        documents,
        selectedSourceId,
        highlightRange,
        loading,
        uploading,
    } = useAppSelector((state) => state.notebookSession);

    const [mobileTab, setMobileTab] = useState<MobileTab>('chat');

    useEffect(() => {
        if (sessionId) {
            dispatch(fetchSession(sessionId));
            dispatch(fetchDocuments(sessionId));
        }

        return () => {
            dispatch(clearSession());
        };
    }, [sessionId, dispatch]);

    // Handle errors
    useEffect(() => {
        if (!loading && !session && sessionId) {
            // Session failed to load, redirect
            toast.error('Failed to load notebook');
            router.push('/');
        }
    }, [loading, session, sessionId, router]);

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
            await dispatch(deleteDocument({ sessionId, documentId: docId })).unwrap();
            toast.success('Source deleted successfully');
        } catch (error) {
            console.error('Failed to delete source', error);
            toast.error('Failed to delete source');
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            await dispatch(uploadDocument({ sessionId, file })).unwrap();
            toast.success('File uploaded and processing...');
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        }
    };

    const handleTitleChange = async (newTitle: string) => {
        try {
            await dispatch(renameSession({ sessionId, title: newTitle })).unwrap();
            toast.success('Notebook renamed successfully');
        } catch (error) {
            console.error('Failed to rename notebook', error);
            toast.error('Failed to rename notebook');
        }
    };

    const handleCitationClick = (citation: any) => {
        const foundDoc = documents.find(d => d.filename === citation.sourceName || d.name === citation.sourceName);

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
