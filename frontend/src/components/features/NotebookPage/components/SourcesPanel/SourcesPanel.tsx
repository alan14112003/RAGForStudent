'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, FolderOpen } from 'lucide-react';
import { DocumentSource } from '@/types';
import SourceItem from './components/SourceItem';
import AddSourceModal from './components/AddSourceModal';

interface SourcesPanelProps {
    documents: DocumentSource[];
    selectedSourceId: number | string | null;
    onSelectSource: (id: number) => void;
    onDeleteSource: (id: number) => void;
    onUpload: (file: File) => Promise<void>;
    uploading: boolean;
}

export default function SourcesPanel({
    documents,
    selectedSourceId,
    onSelectSource,
    onDeleteSource,
    onUpload,
    uploading,
}: SourcesPanelProps) {
    const [showUploadModal, setShowUploadModal] = useState(false);

    const handleUpload = async (file: File) => {
        await onUpload(file);
        setShowUploadModal(false);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="p-4 border-b flex items-center justify-between shrink-0">
                <h2 className="font-semibold text-sm text-foreground">Sources</h2>
                <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setShowUploadModal(true)}>
                    <Plus size={14} />
                    <span className="hidden lg:inline">Add</span>
                </Button>
            </div>

            <ScrollArea className="flex-1 p-3 min-h-0">
                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                            <FolderOpen size={20} className="opacity-50" />
                        </div>
                        <p className="text-sm font-medium">No sources yet</p>
                        <p className="text-xs mt-1">Upload files to get started</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {documents.map((src) => (
                            <SourceItem
                                key={src.id}
                                source={src}
                                isSelected={selectedSourceId === src.id}
                                onClick={() => onSelectSource(src.id)}
                                onDelete={onDeleteSource}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>

            <AddSourceModal
                open={showUploadModal}
                onOpenChange={setShowUploadModal}
                onUpload={handleUpload}
                uploading={uploading}
            />
        </div>
    );
}
