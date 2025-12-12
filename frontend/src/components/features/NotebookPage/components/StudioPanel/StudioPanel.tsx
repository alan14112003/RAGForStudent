'use client';

import { Sparkles } from 'lucide-react';
import SourceDetail from './components/SourceDetail';
import QuizPanel from './components/QuizPanel';
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

    // If a source is selected, show its details
    if (selectedSource) {
        return (
            <SourceDetail
                source={selectedSource}
                highlightRange={highlightRange}
            />
        );
    }

    // Default: show studio home with QuizPanel
    return (
        <div className="h-full flex flex-col bg-background/50">
            {/* Header */}
            <div className="p-4 border-b flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Sparkles size={16} className="text-purple-500" />
                </div>
                <div>
                    <h3 className="font-semibold text-sm">Studio</h3>
                    <p className="text-xs text-muted-foreground">AI-powered learning tools</p>
                </div>
            </div>

            {/* Quiz Panel */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <QuizPanel />
            </div>
        </div>
    );
}
