'use client';

import { Button } from '@/components/ui/button';
import { FileText, Trash2 } from 'lucide-react';

interface SourceItemProps {
    source: {
        id: number;
        filename?: string;
        name?: string;
        created_at?: string;
    };
    isSelected: boolean;
    onClick: () => void;
    onDelete: (id: number) => void;
}

export default function SourceItem({ source, isSelected, onClick, onDelete }: SourceItemProps) {
    return (
        <div
            onClick={onClick}
            className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${isSelected
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
                    onDelete(source.id);
                }}
            >
                <Trash2 size={14} />
            </Button>
        </div>
    );
}
