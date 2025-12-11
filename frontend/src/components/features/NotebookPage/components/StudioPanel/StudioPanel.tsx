'use client';

import { Sparkles } from 'lucide-react';
import SourceDetail from './components/SourceDetail';
import { useAppSelector } from '@/store';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { chatService } from '@/services/chatService';

export default function StudioPanel() {
    const { sessionId, selectedSourceId, highlightRange } = useAppSelector((state) => state.ui);

    // Fetch documents (uses cache)
    const { data: documents = [] } = useQuery({
        queryKey: queryKeys.notebooks.documents(sessionId),
        queryFn: () => chatService.getChatDocuments(sessionId),
        enabled: !!sessionId,
    });

    const selectedSource = documents.find((d: any) => d.id === selectedSourceId) || null;

    if (!selectedSource) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-background/50 text-center p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                    <Sparkles size={28} className="text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Studio</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Select a source to view details or get AI-powered insights.
                </p>
            </div>
        );
    }

    return (
        <SourceDetail
            source={selectedSource}
            highlightRange={highlightRange}
        />
    );
}
