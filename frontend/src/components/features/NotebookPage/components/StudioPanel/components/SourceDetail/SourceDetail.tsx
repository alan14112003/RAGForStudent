'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, FileText, Calendar, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectSource, setHighlightRange } from '@/store/features/uiSlice';
import SummaryPanel from '../SummaryPanel';

interface SourceDetailProps {
    source: {
        id: number;
        name?: string;
        filename?: string;
        type?: string;
        date?: string;
        created_at?: string;
        content?: string;
    } | null;
    highlightRange?: {
        start: number;
        end: number;
    };
}

export default function SourceDetail({ source, highlightRange }: SourceDetailProps) {
    const dispatch = useAppDispatch();
    const { sessionId } = useAppSelector((state) => state.ui);

    const handleClose = () => {
        dispatch(selectSource(null));
        dispatch(setHighlightRange(undefined));
    };
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const highlightRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (highlightRange && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightRange, source]);

    if (!source) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText size={32} className="opacity-50" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No Source Selected</h3>
                <p className="text-sm">Select a source from the list to view its details here.</p>
            </div>
        );
    }

    const renderContent = () => {
        if (!source.content) return <p className="italic text-muted-foreground">No content available for this source.</p>;

        if (!highlightRange) {
            return (
                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {source.content}
                    </ReactMarkdown>
                </div>
            );
        }

        const { start, end } = highlightRange;
        if (start < 0 || end > source.content.length || start >= end) {
            return (
                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {source.content}
                    </ReactMarkdown>
                </div>
            );
        }

        const before = source.content.substring(0, start);
        const highlighted = source.content.substring(start, end);
        const after = source.content.substring(end);

        return (
            <div className="whitespace-pre-wrap leading-relaxed text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ node, ...props }) => <span {...props} className="block mb-2" /> }}>
                    {before}
                </ReactMarkdown>

                <mark ref={highlightRef} className="bg-indigo-300 dark:bg-indigo-600/50 rounded-sm px-0.5 text-black dark:text-white font-medium inline-block">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ node, ...props }) => <span {...props} />,
                        }}
                    >
                        {highlighted}
                    </ReactMarkdown>
                </mark>

                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ node, ...props }) => <span {...props} className="block mb-2" /> }}>
                    {after}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-background border-l">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-0">
                    <div className="h-8 w-8 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0">
                        <FileText size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-sm truncate" title={source.filename || source.name}>
                            {source.filename || source.name || 'Untitled'}
                        </h2>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar size={10} />
                            {source.created_at ? new Date(source.created_at).toLocaleDateString('vi-VN') : source.date || 'Unknown date'}
                        </span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClose} className="shrink-0">
                    <X size={16} />
                </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="content" className="flex-1 flex flex-col min-h-0">
                <div className="px-4 pt-2 border-b">
                    <TabsList className="grid w-full grid-cols-2 h-9">
                        <TabsTrigger value="content" className="text-xs gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            Content
                        </TabsTrigger>
                        <TabsTrigger value="summary" className="text-xs gap-1.5">
                            <Sparkles className="h-3.5 w-3.5" />
                            Summary
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="content" className="flex-1 m-0 min-h-0">
                    <ScrollArea className="h-full p-6" ref={scrollAreaRef}>
                        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                            {renderContent()}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="summary" className="flex-1 m-0 min-h-0">
                    <ScrollArea className="h-full p-6">
                        <SummaryPanel
                            sessionId={sessionId}
                            documentId={source.id}
                        />
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}
