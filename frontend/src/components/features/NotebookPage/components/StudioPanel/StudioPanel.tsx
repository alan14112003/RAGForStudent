'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sparkles, BookOpen, Layers, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import SourceDetail from './components/SourceDetail';
import StudioItemCard from './components/StudioItemCard';
import GenerateQuizDialog from './components/GenerateQuizDialog';
import GenerateFlashcardDialog from './components/GenerateFlashcardDialog';
import { useAppSelector } from '@/store';
import { queryKeys } from '@/lib/queryKeys';
import { documentService } from '@/services/documentService';
import { studioService } from '@/services/studioService';
import { quizService } from '@/services/quizService';
import { flashcardService } from '@/services/flashcardService';
import { StudioItem } from '@/types';
import { toast } from 'react-toastify';

export default function StudioPanel() {
    const { sessionId, selectedSourceId, highlightRange } = useAppSelector((state) => state.ui);
    const [showQuizDialog, setShowQuizDialog] = useState(false);
    const [showFlashcardDialog, setShowFlashcardDialog] = useState(false);
    const queryClient = useQueryClient();

    // Fetch documents (uses cache)
    const { data: documents = [] } = useQuery({
        queryKey: queryKeys.notebooks.documents(sessionId),
        queryFn: () => documentService.getChatDocuments(sessionId),
        enabled: !!sessionId,
    });

    // Fetch unified studio items
    const { data: studioData, isLoading } = useQuery({
        queryKey: queryKeys.notebooks.studioItems(sessionId),
        queryFn: () => studioService.getStudioItems(sessionId),
        enabled: !!sessionId,
        refetchInterval: 5000, // Poll for status updates during generation
    });

    const studioItems = studioData?.items || [];

    // Delete mutations
    const deleteQuizMutation = useMutation({
        mutationFn: (quizId: number) => quizService.deleteQuiz(sessionId, quizId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notebooks.studioItems(sessionId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.notebooks.quizzes(sessionId) });
            toast.success('Đã xóa quiz');
        },
        onError: () => {
            toast.error('Không thể xóa quiz');
        },
    });

    const deleteFlashcardMutation = useMutation({
        mutationFn: (setId: number) => flashcardService.deleteFlashcardSet(sessionId, setId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notebooks.studioItems(sessionId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.notebooks.flashcards(sessionId) });
            toast.success('Đã xóa bộ flashcard');
        },
        onError: () => {
            toast.error('Không thể xóa bộ flashcard');
        },
    });

    const handleDelete = (item: StudioItem) => {
        if (item.type === 'quiz') {
            deleteQuizMutation.mutate(item.id);
        } else {
            deleteFlashcardMutation.mutate(item.id);
        }
    };

    const selectedSource = documents.find((d: any) => d.id === selectedSourceId) || null;

    // If a source is selected, show its details
    if (selectedSource) {
        return (
            <SourceDetail
                source={selectedSource}
                highlightRange={highlightRange}
            />
        );
    }

    // Default: show studio home with action buttons and unified list
    return (
        <div className="h-full flex flex-col bg-background/50">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Sparkles size={16} className="text-purple-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-sm">Studio</h3>
                    <p className="text-xs text-muted-foreground">AI-powered learning tools</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="p-3 border-b shrink-0">
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5"
                        onClick={() => setShowQuizDialog(true)}
                    >
                        <BookOpen size={14} />
                        <Plus size={12} />
                        <span>Tạo Quiz</span>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1.5"
                        onClick={() => setShowFlashcardDialog(true)}
                    >
                        <Layers size={14} />
                        <Plus size={12} />
                        <span>Tạo Flashcard</span>
                    </Button>
                </div>
            </div>

            {/* Studio Items List */}
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-muted-foreground" size={24} />
                        </div>
                    ) : studioItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Sparkles size={20} className="opacity-50" />
                            </div>
                            <p className="text-sm font-medium">Chưa có nội dung học tập</p>
                            <p className="text-xs mt-1">Tạo Quiz hoặc Flashcard để bắt đầu</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {studioItems.map((item: StudioItem) => (
                                <StudioItemCard
                                    key={`${item.type}-${item.id}`}
                                    item={item}
                                    onDelete={() => handleDelete(item)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Generate Dialogs */}
            <GenerateQuizDialog
                open={showQuizDialog}
                onOpenChange={setShowQuizDialog}
            />
            <GenerateFlashcardDialog
                open={showFlashcardDialog}
                onOpenChange={setShowFlashcardDialog}
            />
        </div>
    );
}
