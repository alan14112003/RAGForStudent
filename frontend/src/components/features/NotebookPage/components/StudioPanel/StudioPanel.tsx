'use client';

import { useState } from 'react';
import { Sparkles, BookOpen, Layers } from 'lucide-react';
import SourceDetail from './components/SourceDetail';
import QuizPanel from './components/QuizPanel';
import FlashcardPanel from './components/FlashcardPanel';
import { useAppSelector } from '@/store';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { documentService } from '@/services/documentService';
import { cn } from '@/lib/utils';

type StudioTab = 'quiz' | 'flashcard';

export default function StudioPanel() {
    const { sessionId, selectedSourceId, highlightRange } = useAppSelector((state) => state.ui);
    const [activeTab, setActiveTab] = useState<StudioTab>('quiz');

    // Fetch documents (uses cache)
    const { data: documents = [] } = useQuery({
        queryKey: queryKeys.notebooks.documents(sessionId),
        queryFn: () => documentService.getChatDocuments(sessionId),
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

    // Default: show studio home with tabs
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

            {/* Tabs */}
            <div className="px-4 py-2 border-b shrink-0">
                <div className="flex gap-1 p-1 bg-muted rounded-lg">
                    <button
                        onClick={() => setActiveTab('quiz')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === 'quiz'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <BookOpen size={16} />
                        <span>Quiz</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('flashcard')}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all",
                            activeTab === 'flashcard'
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Layers size={16} />
                        <span>Flashcard</span>
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {activeTab === 'quiz' ? <QuizPanel /> : <FlashcardPanel />}
            </div>
        </div>
    );
}
