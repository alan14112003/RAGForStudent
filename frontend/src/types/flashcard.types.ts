// Flashcard types for flashcard generation feature

export type FlashcardStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface Flashcard {
    id: number;
    front_text: string;
    back_text: string;
    order_index: number;
}

export interface FlashcardSet {
    id: number;
    session_id: number;
    title: string;
    status: FlashcardStatus;
    document_ids?: number[];
    num_cards: number;
    created_at: string;
    updated_at?: string;
    cards?: Flashcard[];
}

export interface FlashcardSetListItem {
    id: number;
    session_id: number;
    title: string;
    status: FlashcardStatus;
    num_cards: number;
    created_at: string;
}

export interface FlashcardSetListResponse {
    items: FlashcardSetListItem[];
    total: number;
}

export interface FlashcardGenerateRequest {
    document_ids: number[];
    num_cards: number;
    title?: string;
}
