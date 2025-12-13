'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, CheckCircle } from 'lucide-react';
import { documentService } from '@/services/documentService';
import { queryKeys } from '@/lib/queryKeys';
import { SummaryScope, SummaryFormat, ChapterInfo } from '@/types';
import { useAppDispatch } from '@/store';
import { setMobileTab, selectSource } from '@/store/features/uiSlice';
import SummaryOptions from './components/SummaryOptions';

interface SummaryPanelProps {
    sessionId: string;
    documentId: number;
}

export default function SummaryPanel({ sessionId, documentId }: SummaryPanelProps) {
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    // Fetch chapters (only when needed for chapter scope)
    const {
        data: chaptersData,
        isLoading: isLoadingChapters,
        refetch: fetchChapters
    } = useQuery({
        queryKey: queryKeys.notebooks.chapters(sessionId, documentId),
        queryFn: () => documentService.getDocumentChapters(sessionId, documentId),
        enabled: false, // Only fetch on demand
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Summarize mutation
    const summarizeMutation = useMutation({
        mutationFn: async ({
            scope,
            format,
            chapterIndices
        }: {
            scope: SummaryScope;
            format: SummaryFormat;
            chapterIndices?: number[]
        }) => {
            return documentService.summarizeDocument(sessionId, documentId, {
                scope,
                format,
                chapter_indices: chapterIndices,
            });
        },
        onSuccess: () => {
            // Invalidate chat session to refresh messages
            queryClient.invalidateQueries({
                queryKey: queryKeys.notebooks.detail(sessionId)
            });

            // Close source detail and switch to chat tab
            dispatch(selectSource(null));
            dispatch(setMobileTab('chat'));
        },
    });

    const handleSummarize = useCallback(async (
        scope: SummaryScope,
        format: SummaryFormat,
        chapterIndices?: number[]
    ) => {
        summarizeMutation.mutate({ scope, format, chapterIndices });
    }, [summarizeMutation]);

    // Handle scope change - fetch chapters when switching to chapter scope
    const handleScopeChange = useCallback((scope: SummaryScope) => {
        if (scope === 'chapter' && !chaptersData) {
            fetchChapters();
        }
    }, [chaptersData, fetchChapters]);

    // Auto-fetch chapters when component mounts if we'll need them
    const chapters: ChapterInfo[] = chaptersData?.chapters || [];

    return (
        <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0 pb-4">
                <CardTitle className="flex items-center gap-2 text-base">
                    <div className="h-7 w-7 rounded-lg bg-linear-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
                {/* Options */}
                <SummaryOptions
                    chapters={chapters}
                    isLoadingChapters={isLoadingChapters}
                    onSummarize={handleSummarize}
                    isGenerating={summarizeMutation.isPending}
                    onScopeChange={handleScopeChange}
                />

                {/* Status messages */}
                {summarizeMutation.isPending && (
                    <>
                        <div className="border-t border-border" />
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-3 animate-pulse">
                                <Sparkles className="h-6 w-6 text-primary animate-spin" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Generating summary, please wait...
                            </p>
                        </div>
                    </>
                )}

                {summarizeMutation.isSuccess && (
                    <>
                        <div className="border-t border-border" />
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-3">
                                <CheckCircle className="h-6 w-6 text-green-500" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Summary generated and displayed in chat!
                            </p>
                        </div>
                    </>
                )}

                {summarizeMutation.isError && (
                    <>
                        <div className="border-t border-border" />
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-sm text-destructive">
                                An error occurred while generating summary. Please try again.
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
