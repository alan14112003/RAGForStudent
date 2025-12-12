'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, Plus, Loader2 } from 'lucide-react';
import { queryKeys } from '@/lib/queryKeys';
import { flashcardService } from '@/services/flashcardService';
import { useAppSelector } from '@/store';
import { FlashcardSetListItem } from '@/types';
import { toast } from 'react-toastify';
import GenerateFlashcardDialog from './components/GenerateFlashcardDialog';
import FlashcardItem from './components/FlashcardItem';

export default function FlashcardPanel() {
    const [showGenerateDialog, setShowGenerateDialog] = useState(false);
    const { sessionId } = useAppSelector((state) => state.ui);
    const queryClient = useQueryClient();

    // Fetch flashcard sets
    const { data: flashcardsData, isLoading } = useQuery({
        queryKey: queryKeys.notebooks.flashcards(sessionId),
        queryFn: () => flashcardService.getFlashcardSets(sessionId),
        enabled: !!sessionId,
        refetchInterval: 5000, // Poll for status updates during generation
    });

    const flashcardSets = flashcardsData?.items || [];

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (setId: number) => flashcardService.deleteFlashcardSet(sessionId, setId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notebooks.flashcards(sessionId) });
            toast.success('Đã xóa bộ flashcard');
        },
        onError: () => {
            toast.error('Không thể xóa bộ flashcard');
        },
    });

    const handleDelete = (setId: number) => {
        if (confirm('Bạn có chắc muốn xóa bộ flashcard này?')) {
            deleteMutation.mutate(setId);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Layers size={18} className="text-blue-500" />
                    <h3 className="font-semibold text-sm">Flashcard</h3>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    onClick={() => setShowGenerateDialog(true)}
                >
                    <Plus size={14} />
                    <span className="hidden lg:inline">Tạo Flashcard</span>
                </Button>
            </div>

            {/* Flashcard List */}
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-muted-foreground" size={24} />
                        </div>
                    ) : flashcardSets.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <Layers size={20} className="opacity-50" />
                            </div>
                            <p className="text-sm font-medium">Chưa có flashcard nào</p>
                            <p className="text-xs mt-1">Chọn tài liệu và tạo flashcard mới</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {flashcardSets.map((set: FlashcardSetListItem) => (
                                <FlashcardItem
                                    key={set.id}
                                    flashcardSet={set}
                                    onDelete={() => handleDelete(set.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Generate Dialog */}
            <GenerateFlashcardDialog
                open={showGenerateDialog}
                onOpenChange={setShowGenerateDialog}
            />
        </div>
    );
}
