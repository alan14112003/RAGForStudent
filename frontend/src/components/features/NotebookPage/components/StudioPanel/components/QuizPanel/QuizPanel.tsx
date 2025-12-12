'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Plus, Loader2 } from 'lucide-react';
import { queryKeys } from '@/lib/queryKeys';
import { chatService } from '@/services/chatService';
import { useAppSelector } from '@/store';
import { QuizListItem } from '@/types';
import { toast } from 'react-toastify';
import GenerateQuizDialog from './components/GenerateQuizDialog';
import QuizItem from './components/QuizItem';

export default function QuizPanel() {
    const [showGenerateDialog, setShowGenerateDialog] = useState(false);
    const { sessionId } = useAppSelector((state) => state.ui);
    const queryClient = useQueryClient();

    // Fetch quizzes
    const { data: quizzesData, isLoading } = useQuery({
        queryKey: queryKeys.notebooks.quizzes(sessionId),
        queryFn: () => chatService.getQuizzes(sessionId),
        enabled: !!sessionId,
        refetchInterval: 5000, // Poll for status updates during generation
    });

    const quizzes = quizzesData?.items || [];

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (quizId: number) => chatService.deleteQuiz(sessionId, quizId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notebooks.quizzes(sessionId) });
            toast.success('Đã xóa quiz');
        },
        onError: () => {
            toast.error('Không thể xóa quiz');
        },
    });

    const handleDelete = (quizId: number) => {
        if (confirm('Bạn có chắc muốn xóa quiz này?')) {
            deleteMutation.mutate(quizId);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-purple-500" />
                    <h3 className="font-semibold text-sm">Quiz & Trắc nghiệm</h3>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1.5"
                    onClick={() => setShowGenerateDialog(true)}
                >
                    <Plus size={14} />
                    <span className="hidden lg:inline">Tạo Quiz</span>
                </Button>
            </div>

            {/* Quiz List */}
            <ScrollArea className="flex-1 min-h-0">
                <div className="p-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin text-muted-foreground" size={24} />
                        </div>
                    ) : quizzes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <BookOpen size={20} className="opacity-50" />
                            </div>
                            <p className="text-sm font-medium">Chưa có quiz nào</p>
                            <p className="text-xs mt-1">Chọn tài liệu và tạo quiz mới</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {quizzes.map((quiz: QuizListItem) => (
                                <QuizItem
                                    key={quiz.id}
                                    quiz={quiz}
                                    onDelete={() => handleDelete(quiz.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Generate Dialog */}
            <GenerateQuizDialog
                open={showGenerateDialog}
                onOpenChange={setShowGenerateDialog}
            />
        </div>
    );
}
