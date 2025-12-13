// Studio types for unified studio items (quiz + flashcard)

export type StudioItemType = 'quiz' | 'flashcard';

// Status as string to handle any case from backend (PENDING, pending, etc.)
export type StudioItemStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface StudioItem {
    id: number;
    type: StudioItemType;
    title: string;
    status: string; // Keep as string for flexibility with backend responses
    itemCount: number;
    quizType?: string;
    createdAt: string;
}

export interface StudioItemsResponse {
    items: StudioItem[];
    total: number;
}

