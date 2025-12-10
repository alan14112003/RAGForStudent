'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, FolderOpen } from 'lucide-react';
import { DocumentSource } from '@/types';
import SourceItem from './components/SourceItem';
import AddSourceModal from './components/AddSourceModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chatService';
import { useAppSelector } from '@/store';
import { toast } from 'react-toastify';
import { queryKeys } from '@/lib/queryKeys';

interface SourcesPanelProps {
    documents: DocumentSource[];
    selectedSourceId: number | string | null;
    onSelectSource: (id: number) => void;
}

export default function SourcesPanel({
    documents,
    selectedSourceId,
    onSelectSource,
}: SourcesPanelProps) {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const { sessionId } = useAppSelector((state) => state.ui);
    const queryClient = useQueryClient();

    // Upload document mutation
    const uploadMutation = useMutation({
        mutationFn: (file: File) => chatService.uploadFile(sessionId, file),
    });
    const uploading = uploadMutation.isPending;

    const handleUpload = async (file: File) => {
        await handleFileUpload(file);
        setShowUploadModal(false);
    };

    const handleFileUpload = async (file: File) => {
        try {
            await uploadMutation.mutateAsync(file);
            // Refetch documents after upload
            queryClient.invalidateQueries({ queryKey: queryKeys.notebooks.documents(sessionId) });
            toast.success('File uploaded and processing...');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Upload failed');
        }
    };

    return (
        <div className="flex flex-col h-full bg-background overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between shrink-0">
                <h2 className="font-semibold text-sm text-foreground">Sources</h2>
                <Button size="sm" variant="outline" className="h-8 gap-1.5" onClick={() => setShowUploadModal(true)}>
                    <Plus size={14} />
                    <span className="hidden lg:inline">Add</span>
                </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0 w-full">
                <div className="p-3">
                    {documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                <FolderOpen size={20} className="opacity-50" />
                            </div>
                            <p className="text-sm font-medium">No sources yet</p>
                            <p className="text-xs mt-1">Upload files to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-2 w-full">
                            {documents.map((src) => (
                                <SourceItem
                                    key={src.id}
                                    source={src}
                                    isSelected={selectedSourceId === src.id}
                                    onClick={() => onSelectSource(src.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
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
