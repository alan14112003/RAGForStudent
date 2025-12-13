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
import { Loader2, Layers } from 'lucide-react';
import { documentService } from '@/services/documentService';
import { flashcardService } from '@/services/flashcardService';
import { queryKeys } from '@/lib/queryKeys';
import { useAppSelector } from '@/store';
import { DocumentSource } from '@/types';
import { toast } from 'react-toastify';
import DocumentSelector from '@/components/common/DocumentSelector';

interface GenerateFlashcardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function GenerateFlashcardDialog({ open, onOpenChange }: GenerateFlashcardDialogProps) {
    const { sessionId } = useAppSelector((state) => state.ui);
    const queryClient = useQueryClient();

    const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
    const [numCards, setNumCards] = useState(20);
    const [title, setTitle] = useState('');

    // Fetch documents
    const { data: documents = [] } = useQuery<DocumentSource[]>({
        queryKey: queryKeys.notebooks.documents(sessionId),
        queryFn: () => documentService.getChatDocuments(sessionId),
        enabled: !!sessionId && open,
    });

    // Generate mutation
    const generateMutation = useMutation({
        mutationFn: () =>
            flashcardService.generateFlashcards(sessionId, {
                document_ids: selectedDocIds,
                num_cards: numCards,
                title: title || undefined,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notebooks.flashcards(sessionId) });
            toast.success('Đang tạo flashcard, vui lòng đợi...');
            onOpenChange(false);
            resetForm();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Không thể tạo flashcard');
        },
    });

    const resetForm = () => {
        setSelectedDocIds([]);
        setNumCards(20);
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
                        <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Layers className="text-white" size={20} />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">Tạo Flashcard mới</DialogTitle>
                            <DialogDescription>
                                Chọn tài liệu và cấu hình bộ flashcard
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Content - use explicit max-height for ScrollArea to work */}
                <ScrollArea className="h-[calc(85vh-180px)]">
                    <div className="p-6 space-y-6">
                        {/* Document Selection */}
                        <DocumentSelector
                            documents={documents}
                            selectedIds={selectedDocIds}
                            onSelectionChange={setSelectedDocIds}
                            maxHeight="h-44"
                        />

                        {/* Number of Cards */}
                        <div className="space-y-2">
                            <Label htmlFor="numCards" className="text-sm font-medium">
                                Số lượng thẻ
                            </Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    id="numCards"
                                    type="number"
                                    value={numCards}
                                    onChange={(e) =>
                                        setNumCards(Math.min(50, Math.max(10, Number(e.target.value))))
                                    }
                                    min={10}
                                    max={50}
                                    className="w-28"
                                />
                                <span className="text-sm text-muted-foreground">thẻ (10 - 50)</span>
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
                        className="bg-linear-to-br from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    >
                        {generateMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        <Layers size={16} className="mr-2" />
                        Tạo Flashcard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
