'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FileText, FolderOpen } from 'lucide-react';
import { DocumentSource } from '@/types';
import { cn } from '@/lib/utils';

interface DocumentSelectorProps {
    documents: DocumentSource[];
    selectedIds: number[];
    onSelectionChange: (ids: number[]) => void;
    label?: string;
    maxHeight?: string;
    className?: string;
}

export default function DocumentSelector({
    documents,
    selectedIds,
    onSelectionChange,
    label = 'Chọn tài liệu nguồn',
    maxHeight = 'h-40',
    className,
}: DocumentSelectorProps) {
    const toggleDocument = (docId: number) => {
        onSelectionChange(
            selectedIds.includes(docId)
                ? selectedIds.filter((id) => id !== docId)
                : [...selectedIds, docId]
        );
    };

    const toggleAll = () => {
        if (selectedIds.length === documents.length) {
            onSelectionChange([]);
        } else {
            onSelectionChange(documents.map((doc) => doc.id));
        }
    };

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{label}</Label>
                {documents.length > 0 && (
                    <button
                        type="button"
                        onClick={toggleAll}
                        className="text-xs text-primary hover:underline cursor-pointer"
                    >
                        {selectedIds.length === documents.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                    </button>
                )}
            </div>

            <div className={cn('border rounded-lg bg-muted/30 overflow-hidden', maxHeight)}>
                <ScrollArea className="h-full w-full">
                    {documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                            <FolderOpen size={24} className="mb-2 opacity-50" />
                            <p className="text-sm">Chưa có tài liệu nào</p>
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {documents.map((doc) => {
                                const isSelected = selectedIds.includes(doc.id);
                                return (
                                    <div
                                        key={doc.id}
                                        onClick={() => toggleDocument(doc.id)}
                                        title={doc.filename}
                                        className={cn(
                                            'flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors',
                                            'hover:bg-accent',
                                            isSelected && 'bg-accent/80 ring-1 ring-primary/20'
                                        )}
                                    >
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => toggleDocument(doc.id)}
                                            className="pointer-events-none"
                                        />
                                        <FileText size={16} className="text-muted-foreground shrink-0" />
                                        <span
                                            className="text-sm truncate flex-1"
                                            title={doc.filename}
                                        >
                                            {doc.filename}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </div>

            <p className="text-xs text-muted-foreground">
                Đã chọn <span className="font-medium text-foreground">{selectedIds.length}</span> / {documents.length} tài liệu
            </p>
        </div>
    );
}
