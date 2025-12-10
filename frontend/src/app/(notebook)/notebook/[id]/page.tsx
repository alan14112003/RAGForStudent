'use client';

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import ChatInterface from "@/components/features/chat/chat-interface";
import { useEffect, useState, useRef, use } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Plus, Search, Sparkles, Book, Loader2, Trash2, MessageSquare, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import SourceDetail from "@/components/features/notebook/source-detail";
import AddSourceModal from "@/components/features/notebook/AddSourceModal";
import Header from '@/components/features/header';
import { useRouter } from "next/navigation";
import { chatService } from "@/services/chatService";
import { toast } from "react-toastify";
import { ChatSessionDetail } from "@/types";
import { useIsMobile } from "@/hooks";
import { cn } from "@/lib/utils";

type MobileTab = 'sources' | 'chat' | 'studio';

export default function NotebookPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const isMobile = useIsMobile();
    const [session, setSession] = useState<ChatSessionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSourceId, setSelectedSourceId] = useState<number | string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [mobileTab, setMobileTab] = useState<MobileTab>('chat');

    const [documents, setDocuments] = useState<any[]>([]);
    const [highlightRange, setHighlightRange] = useState<{ start: number, end: number } | undefined>(undefined);

    const { id: sessionId } = use(params);

    useEffect(() => {
        if (sessionId) {
            loadSession(sessionId);
            loadDocuments(sessionId);
        }
    }, [sessionId]);

    const loadSession = async (id: string) => {
        try {
            setLoading(true);
            const data = await chatService.getNotebook(id);
            setSession(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load notebook");
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const loadDocuments = async (id: string) => {
        try {
            const docs = await chatService.getChatDocuments(id);
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to load documents", error);
        }
    };

    const handleDeleteSource = async (docId: number) => {
        if (!sessionId) return;
        if (!confirm("Are you sure you want to delete this source? This action cannot be undone.")) return;

        try {
            await chatService.deleteDocument(sessionId, docId);
            toast.success("Source deleted successfully");
            setDocuments(prev => prev.filter(d => d.id !== docId));
            if (selectedSourceId === docId) {
                setSelectedSourceId(null);
            }
        } catch (error) {
            console.error("Failed to delete source", error);
            toast.error("Failed to delete source");
        }
    };

    const handleFileUpload = async (file: File) => {
        if (!file || !sessionId) return;

        try {
            setUploading(true);
            await chatService.uploadFile(sessionId, file);
            toast.success("File uploaded and processing...");
            await loadDocuments(sessionId);
            setShowUploadModal(false);
        } catch (error) {
            console.error(error);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleCitationClick = (citation: any) => {
        console.log("Clicked citation:", citation);
        const foundDoc = documents.find(d => d.filename === citation.sourceName || d.name === citation.sourceName);

        if (foundDoc) {
            setSelectedSourceId(foundDoc.id);
            setHighlightRange(citation.highlightRange);
            // On mobile, switch to studio tab when clicking citation
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
    const selectedSource = documents.find(s => s.id === selectedSourceId || s.db_document_id === selectedSourceId) || null;

    // Sources Panel Content
    const SourcesContent = () => (
        <div className="flex flex-col h-full p-4 gap-4">
            <div className="flex items-center justify-between shrink-0">
                <h2 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Sources</h2>
            </div>

            <div className="relative shrink-0">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search sources..." className="pl-8 h-9 text-sm bg-background" />
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2 min-h-0" type="hover">
                <div className="space-y-1 pb-4">
                    {documents.map((src: any) => (
                        <div
                            key={src.id}
                            onClick={() => {
                                setSelectedSourceId(src.id);
                                setHighlightRange(undefined);
                                if (isMobile) setMobileTab('studio');
                            }}
                            className={`group w-full max-w-full flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer border relative pr-8 ${selectedSourceId === src.id
                                ? "bg-background border-primary/20 shadow-sm ring-1 ring-primary/10"
                                : "border-transparent hover:bg-background hover:border-border"
                                }`}
                        >
                            <div className={`h-8 w-8 rounded flex items-center justify-center shrink-0 ${src.filename?.endsWith('.pdf') ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                                }`}>
                                <FileText size={16} />
                            </div>
                            <div className="flex-1 min-w-0 grid gap-0.5">
                                <p className={`text-sm font-medium truncate ${selectedSourceId === src.id ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                                    {src.filename || src.name}
                                </p>
                                <p className="text-[10px] text-muted-foreground/70 truncate">{src.created_at ? new Date(src.created_at).toLocaleDateString() : ''}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all shrink-0"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSource(src.id);
                                }}
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    ))}
                    {documents.length === 0 && (
                        <div className="text-center p-4 text-muted-foreground text-sm">No sources yet</div>
                    )}
                </div>
            </ScrollArea>

            <Button
                className="w-full gap-2 shrink-0 bg-background border border-input text-foreground hover:bg-accent hover:text-accent-foreground shadow-sm"
                onClick={() => setShowUploadModal(true)}
            >
                <Plus size={16} />
                Add Source
            </Button>
        </div>
    );

    // Studio Panel Content
    const StudioContent = () => (
        selectedSource ? (
            <SourceDetail
                source={selectedSource}
                onClose={() => setSelectedSourceId(null)}
                highlightRange={highlightRange}
            />
        ) : (
            <div className="flex flex-col h-full p-6 gap-6 overflow-y-auto">
                <div className="flex items-center justify-between shrink-0">
                    <h2 className="font-semibold text-lg text-foreground">Studio</h2>
                </div>

                <div className="grid grid-cols-2 gap-3 shrink-0">
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer p-4 flex flex-col gap-3 items-start border-border/60 shadow-sm">
                        <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600"><Sparkles size={20} /></div>
                        <div>
                            <span className="text-sm font-semibold block">FAQ</span>
                            <span className="text-xs text-muted-foreground">Generate FAQs from sources</span>
                        </div>
                    </Card>
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer p-4 flex flex-col gap-3 items-start border-border/60 shadow-sm">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600"><Book size={20} /></div>
                        <div>
                            <span className="text-sm font-semibold block">Study Guide</span>
                            <span className="text-xs text-muted-foreground">Create a comprehensive guide</span>
                        </div>
                    </Card>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-center p-4">
                    <Sparkles className="h-12 w-12 mb-4 opacity-20" />
                    <h3 className="font-medium text-sm mb-1">Select a source to view content</h3>
                    <p className="text-xs max-w-[200px]">Or use the Studio tools above to generate study materials.</p>
                </div>
            </div>
        )
    );

    // Mobile Tab Navigation
    const MobileTabNav = () => (
        <div className="flex border-b bg-muted/30 shrink-0">
            <button
                onClick={() => setMobileTab('sources')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2",
                    mobileTab === 'sources'
                        ? "border-primary text-primary bg-background"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                )}
            >
                <FolderOpen size={18} />
                <span>Sources</span>
            </button>
            <button
                onClick={() => setMobileTab('chat')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2",
                    mobileTab === 'chat'
                        ? "border-primary text-primary bg-background"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                )}
            >
                <MessageSquare size={18} />
                <span>Chat</span>
            </button>
            <button
                onClick={() => setMobileTab('studio')}
                className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2",
                    mobileTab === 'studio'
                        ? "border-primary text-primary bg-background"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                )}
            >
                <Sparkles size={18} />
                <span>Studio</span>
            </button>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-background">
            <Header title={session.title}>
                <Button variant="outline" size="sm" className="hidden sm:flex"><Sparkles size={16} className="mr-2" /> Audio Overview</Button>
            </Header>

            {/* Mobile Layout */}
            {isMobile ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <MobileTabNav />
                    <div className="flex-1 overflow-hidden">
                        {mobileTab === 'sources' && (
                            <div className="h-full bg-muted/30">
                                <SourcesContent />
                            </div>
                        )}
                        {mobileTab === 'chat' && (
                            <ChatInterface
                                sessionId={sessionId}
                                initialMessages={session.messages || []}
                                onCitationClick={handleCitationClick}
                            />
                        )}
                        {mobileTab === 'studio' && (
                            <div className="h-full bg-muted/10">
                                <StudioContent />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Desktop Layout - Resizable Panels */
                <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
                    {/* LEFT SIDEBAR: SOURCES */}
                    <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-muted/30 border-r flex flex-col">
                        <SourcesContent />
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* CENTER: CHAT */}
                    <ResizablePanel defaultSize={55} minSize={35} className="flex flex-col h-full overflow-hidden">
                        <ChatInterface
                            sessionId={sessionId}
                            initialMessages={session.messages || []}
                            onCitationClick={handleCitationClick}
                        />
                    </ResizablePanel>

                    <ResizableHandle />

                    {/* RIGHT SIDEBAR: STUDIO/DETAIL */}
                    <ResizablePanel defaultSize={25} minSize={20} maxSize={40} className="bg-muted/10 border-l flex flex-col h-full overflow-hidden">
                        <StudioContent />
                    </ResizablePanel>

                </ResizablePanelGroup>
            )}

            {/* Add Source Modal */}
            <AddSourceModal
                open={showUploadModal}
                onOpenChange={setShowUploadModal}
                onUpload={handleFileUpload}
                uploading={uploading}
            />
        </div>
    );
}


