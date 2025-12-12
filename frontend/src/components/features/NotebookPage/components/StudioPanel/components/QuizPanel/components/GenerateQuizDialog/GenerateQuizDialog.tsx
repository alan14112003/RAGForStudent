'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { queryKeys } from '@/lib/queryKeys';
import { useAppSelector } from '@/store';
import { QuizType, DocumentSource } from '@/types';
import { toast } from 'react-toastify';
import DocumentSelector from '@/components/common/DocumentSelector';

interface GenerateQuizDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const QUIZ_TYPE_OPTIONS = [
    { value: 'single_choice' as QuizType, label: 'Một đáp án', description: 'Chỉ 1 đáp án đúng' },
    { value: 'multiple_choice' as QuizType, label: 'Nhiều đáp án', description: '2-3 đáp án đúng' },
    { value: 'mixed' as QuizType, label: 'Kết hợp', description: 'Cả 2 loại' },
];

export default function GenerateQuizDialog({ open, onOpenChange }: GenerateQuizDialogProps) {
    const { sessionId } = useAppSelector((state) => state.ui);
    const queryClient = useQueryClient();

    const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
    const [quizType, setQuizType] = useState<QuizType>('mixed');
    const [numQuestions, setNumQuestions] = useState(15);
    const [title, setTitle] = useState('');

    // Fetch documents
    const { data: documents = [] } = useQuery<DocumentSource[]>({
        queryKey: queryKeys.notebooks.documents(sessionId),
        queryFn: () => chatService.getChatDocuments(sessionId),
        enabled: !!sessionId && open,
    });

    // Generate mutation
    const generateMutation = useMutation({
        mutationFn: () =>
            chatService.generateQuiz(sessionId, {
                document_ids: selectedDocIds,
                quiz_type: quizType,
                num_questions: numQuestions,
                title: title || undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notebooks.quizzes(sessionId) });
            toast.success('Đang tạo quiz, vui lòng đợi...');
            onOpenChange(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Không thể tạo quiz');
        },
    });

    const resetForm = () => {
        setSelectedDocIds([]);
        setQuizType('mixed');
        setNumQuestions(15);
        setTitle('');
    };

    const handleSubmit = () => {
        if (selectedDocIds.length === 0) {
            toast.warning('Vui lòng chọn ít nhất một tài liệu');
            return;
        }
        generateMutation.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden flex flex-col">
                {/* Header */}
                <DialogHeader className="shrink-0 p-6 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">Tạo Quiz mới</DialogTitle>
                            <DialogDescription>
                                Chọn tài liệu và cấu hình bài trắc nghiệm
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Content - use explicit max-height for ScrollArea to work */}
                <ScrollArea className="max-h-[calc(85vh-180px)]">
                    <div className="p-6 space-y-6">
                        {/* Document Selection */}
                        <DocumentSelector
                            documents={documents}
                            selectedIds={selectedDocIds}
                            onSelectionChange={setSelectedDocIds}
                            maxHeight="h-44"
                        />

                        {/* Quiz Type */}
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Loại câu hỏi</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {QUIZ_TYPE_OPTIONS.map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setQuizType(type.value)}
                                        className={`
                                            p-4 rounded-xl border-2 text-left transition-all
                                            ${quizType === type.value
                                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                                : 'border-border hover:border-primary/50 hover:bg-accent'
                                            }
                                        `}
                                    >
                                        <div className="font-medium text-sm">{type.label}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {type.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Number of Questions */}
                        <div className="space-y-2">
                            <Label htmlFor="numQuestions" className="text-sm font-medium">
                                Số lượng câu hỏi
                            </Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="numQuestions"
                                    type="number"
                                    value={numQuestions}
                                    onChange={(e) =>
                                        setNumQuestions(Math.min(30, Math.max(10, Number(e.target.value))))
                                    }
                                    min={10}
                                    max={30}
                                    className="w-28"
                                />
                                <span className="text-sm text-muted-foreground">câu (10 - 30)</span>
                            </div>
                        </div>

                        {/* Title (optional) */}
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-medium">
                                Tiêu đề <span className="text-muted-foreground font-normal">(tùy chọn)</span>
                            </Label>
                            <Input
                                id="title"
                                placeholder="Để trống để tự động tạo tiêu đề"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                    </div>
                </ScrollArea>

                {/* Footer */}
                <DialogFooter className="shrink-0 gap-2 sm:gap-2 border-t p-6 pt-4 relative z-10 bg-background">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={selectedDocIds.length === 0 || generateMutation.isPending}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                        {generateMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <Sparkles size={16} className="mr-2" />
                        Tạo Quiz
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    );
}
