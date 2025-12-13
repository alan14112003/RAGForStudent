'use client';

import { useRouter, useParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Trash2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudioItem } from '@/types';
import {
    getStudioItemTypeConfig,
    getStudioStatusConfig,
    isStatusCompleted,
    getQuizTypeLabel,
} from './utils';

interface StudioItemCardProps {
    item: StudioItem;
    onDelete: () => void;
}

export default function StudioItemCard({ item, onDelete }: StudioItemCardProps) {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.id as string;

    // Get config from registry
    const typeConfig = getStudioItemTypeConfig(item.type);
    const statusConfig = getStudioStatusConfig(item.status);
    const isCompleted = isStatusCompleted(item.status);
    const quizTypeLabel = getQuizTypeLabel(item.quizType);

    const handleClick = () => {
        if (!isCompleted || !typeConfig) {
            return;
        }
        router.push(typeConfig.getDetailPath(sessionId, item.id));
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        const confirmMessage = typeConfig?.deleteConfirmMessage || 'Bạn có chắc muốn xóa?';
        if (confirm(confirmMessage)) {
            onDelete();
        }
    };

    const createdAt = new Date(item.createdAt);
    const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true, locale: vi });

    // Fallback if config not found (defensive coding)
    if (!typeConfig) {
        return null;
    }

    return (
        <div
            className={`group p-3 rounded-lg border bg-card transition-all ${isCompleted ? 'hover:bg-accent/50 cursor-pointer hover:shadow-sm' : ''
                }`}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeConfig.containerClassName}`}
                >
                    <span className={typeConfig.iconClassName}>{typeConfig.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate max-w-full" title={item.title}>
                            {item.title}
                        </h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                        <HelpCircle size={12} />
                        <span>
                            {item.itemCount} {typeConfig.itemCountLabel}
                        </span>
                        {quizTypeLabel && (
                            <>
                                <span>•</span>
                                <span>{quizTypeLabel}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5">
                        {statusConfig && (
                            <Badge variant="outline" className={`gap-1 text-xs ${statusConfig.className}`}>
                                {statusConfig.icon}
                                {statusConfig.label}
                            </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">• {timeAgo}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        onClick={handleDelete}
                    >
                        <Trash2 size={14} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
