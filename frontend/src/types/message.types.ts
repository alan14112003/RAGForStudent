// Message and Citation related types for chat UI

export interface Citation {
    id: string;
    sourceName: string;
    sourceId: string; // "S1", "S2", etc.
    documentId?: string;
    page?: number;
    highlightRange?: {
        start: number;
        end: number;
    };
}

// UI Message type used across chat components
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: Citation[];
    createdAt: Date;
}

