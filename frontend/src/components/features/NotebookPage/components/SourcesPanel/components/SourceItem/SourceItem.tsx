'use client';

import { Button } from '@/components/ui/button';
import { queryKeys } from '@/lib/queryKeys';
import { chatService } from '@/services/chatService';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectSource } from '@/store/features/uiSlice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface SourceItemProps {
    source: {
        id: number;
        filename?: string;
        name?: string;
        created_at?: string;
    };
    isSelected: boolean;
    onClick: () => void;
}

export default function SourceItem({ source, isSelected, onClick }: SourceItemProps) {
    const { selectedSourceId, sessionId } = useAppSelector((state) => state.ui);
    const queryClient = useQueryClient();
    const dispatch = useAppDispatch();

    // Delete document mutation
    const deleteMutation = useMutation({
        mutationFn: (documentId: number) => chatService.deleteDocument(sessionId!, documentId),
    });

    const handleDeleteSource = async (docId: number) => {
        if (!confirm('Are you sure you want to delete this source? This action cannot be undone.')) return;

        try {
            await deleteMutation.mutateAsync(docId);
            // Update cache
            queryClient.setQueryData(queryKeys.notebooks.documents(sessionId!), (old: any[] = []) => {
                return old.filter((d: any) => d.id !== docId);
            });

            if (selectedSourceId === docId) {
                dispatch(selectSource(null));
            }

            toast.success('Source deleted successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to delete source');
        }
    };

    return (
        <div
            onClick={onClick}
            className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all w-full overflow-hidden ${isSelected
                ? 'bg-primary/10 border border-primary/30'
                : 'hover:bg-muted/50'
                }`}
        >
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                <FileText size={18} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isSelected ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {source.filename || source.name}
                </p>
                <p className="text-[10px] text-muted-foreground/70 truncate">
                    {source.created_at ? new Date(source.created_at).toLocaleDateString('vi-VN') : ''}
                </p>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSource(source.id);
                }}
            >
                <Trash2 size={14} />
            </Button>
        </div>
    );
}
