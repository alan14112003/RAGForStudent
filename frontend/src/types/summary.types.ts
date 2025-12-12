// Summary types for document summarization feature

export type SummaryScope = 'full' | 'chapter';
export type SummaryFormat = 'bullet' | 'executive' | 'table';

export interface ChapterInfo {
    index: number;
    title: string;
    start_char: number;
    end_char: number;
}

export interface SummaryRequest {
    scope: SummaryScope;
    format: SummaryFormat;
    chapter_indices?: number[];  // Support multiple chapters
}

export interface ChaptersResponse {
    document_id: number;
    chapters: ChapterInfo[];
}

export interface SummaryMessageInfo {
    id: number;
    session_id: number;
    role: string;
    content: string;
    created_at: string;
}

export interface SummaryResponse {
    document_id: number;
    scope: SummaryScope;
    format: SummaryFormat;
    summary: string;
    chapter_title?: string;
    chapters?: ChapterInfo[];
    message: SummaryMessageInfo;
}

