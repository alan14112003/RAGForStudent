'use client';

import { Sparkles } from 'lucide-react';
import { DocumentSource } from '@/types';
import SourceDetail from './components/SourceDetail';

interface StudioPanelProps {
    documents: DocumentSource[];
    selectedSourceId: number | string | null;
    highlightRange?: { start: number; end: number };
    onCloseSource: () => void;
}

export default function StudioPanel({
    documents,
    selectedSourceId,
    highlightRange,
    onCloseSource,
}: StudioPanelProps) {
    const selectedSource = documents.find(d => d.id === selectedSourceId) || null;

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
            onClose={onCloseSource}
            highlightRange={highlightRange}
        />
    );
}
