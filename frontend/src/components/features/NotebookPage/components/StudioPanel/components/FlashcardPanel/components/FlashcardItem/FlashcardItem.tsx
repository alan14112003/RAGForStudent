'use client';

import { useRouter, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layers, Trash2, Loader2, Play } from 'lucide-react';
import { FlashcardSetListItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface FlashcardItemProps {
    flashcardSet: FlashcardSetListItem;
    onDelete: () => void;
}

export default function FlashcardItem({ flashcardSet, onDelete }: FlashcardItemProps) {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.id as string;

    const isGenerating = flashcardSet.status === 'generating' || flashcardSet.status === 'pending';
    const isFailed = flashcardSet.status === 'failed';
    const isCompleted = flashcardSet.status === 'completed';

    const getStatusBadge = () => {
        if (isGenerating) {
            return (
                <Badge variant="secondary" className="gap-1">
                    <Loader2 className="animate-spin" size={12} />
                    Đang tạo
                </Badge>
            );
        }
        if (isFailed) {
            return <Badge variant="destructive">Lỗi</Badge>;
        }
        return (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
                {flashcardSet.num_cards} thẻ
            </Badge>
        );
    };

    const handleStudy = () => {
        if (isCompleted) {
            router.push(`/notebook/${sessionId}/flashcard/${flashcardSet.id}`);
        }
    };

    return (
        <div className="group p-3 rounded-lg border bg-card hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center shrink-0">
                    <Layers size={16} className="text-blue-600" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{flashcardSet.title}</h4>
                        {getStatusBadge()}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(flashcardSet.created_at), {
                            addSuffix: true,
                            locale: vi
                        })}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isCompleted && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={handleStudy}
                        >
                            <Play size={14} />
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={onDelete}
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
