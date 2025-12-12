// Quiz types for Q&A generation feature

export type QuizType = 'single_choice' | 'multiple_choice' | 'mixed';
export type QuizStatus = 'pending' | 'generating' | 'completed' | 'failed';
export type QuestionType = 'single_choice' | 'multiple_choice';

export interface QuizQuestion {
    id: number;
    question_text: string;
    question_type: QuestionType;
    options: string[];
    correct_answers: number[];
    explanation?: string;
    order_index: number;
}

export interface Quiz {
    id: number;
    session_id: number;
    title: string;
    quiz_type: QuizType;
    status: QuizStatus;
    document_ids?: number[];
    num_questions: number;
    created_at: string;
    updated_at?: string;
    questions?: QuizQuestion[];
}

export interface QuizListItem {
    id: number;
    session_id: number;
    title: string;
    quiz_type: QuizType;
    status: QuizStatus;
    num_questions: number;
    created_at: string;
}

export interface QuizListResponse {
    items: QuizListItem[];
    total: number;
}

export interface QuizGenerateRequest {
    document_ids: number[];
    quiz_type: QuizType;
    num_questions: number;
    title?: string;
}
