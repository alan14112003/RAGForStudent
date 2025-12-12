'use client';

import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Trash2, Play, Loader2, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuizListItem, QuizStatus, QuizType } from '@/types';
import { useAppSelector } from '@/store';

interface QuizItemProps {
    quiz: QuizListItem;
    onDelete: () => void;
}

const statusConfig: Record<QuizStatus, { icon: React.ReactNode; label: string; className: string }> = {
    pending: {
        icon: <Loader2 size={14} className="animate-spin" />,
        label: 'Đang chờ',
        className: 'text-yellow-500',
    },
    generating: {
        icon: <Loader2 size={14} className="animate-spin" />,
        label: 'Đang tạo...',
        className: 'text-blue-500',
    },
    completed: {
        icon: <CheckCircle2 size={14} />,
        label: 'Hoàn thành',
        className: 'text-green-500',
    },
    failed: {
        icon: <XCircle size={14} />,
        label: 'Thất bại',
        className: 'text-red-500',
    },
};

const typeLabels: Record<QuizType, string> = {
    single_choice: 'Một đáp án',
    multiple_choice: 'Nhiều đáp án',
    mixed: 'Kết hợp',
};

export default function QuizItem({ quiz, onDelete }: QuizItemProps) {
    const router = useRouter();
    const { sessionId } = useAppSelector((state) => state.ui);
    const status = statusConfig[quiz.status];

    const handlePlay = () => {
        if (quiz.status === 'completed') {
            router.push(`/notebook/${sessionId}/quiz/${quiz.id}`);
        }
    };

    const createdAt = new Date(quiz.created_at);
    const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: vi });

    return (
        <div className="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate" title={quiz.title}>{quiz.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <HelpCircle size={12} />
                        <span>{quiz.num_questions} câu hỏi</span>
                        <span>•</span>
                        <span>{typeLabels[quiz.quiz_type]}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`flex items-center gap-1 text-xs ${status.className}`}>
                            {status.icon}
                            {status.label}
                        </span>
                        <span className="text-xs text-muted-foreground">• {timeAgo}</span>
                    </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {quiz.status === 'completed' && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
                            onClick={handlePlay}
                        >
                            <Play size={16} fill="currentColor" />
                        </Button>
                    )}
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={onDelete}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
