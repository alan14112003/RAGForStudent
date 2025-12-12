import api from './api';
import { Notebook, ChatSessionDetail, PaginatedNotebooks, SummaryRequest, SummaryResponse, ChaptersResponse, Quiz, QuizListResponse, QuizGenerateRequest } from '@/types';

export const chatService = {
    async getNotebooks(page: number = 1, pageSize: number = 12): Promise<PaginatedNotebooks> {
        const response = await api.get('/chats/', { params: { page, page_size: pageSize } });
        return response.data;
    },

    async getNotebookStats(): Promise<{ total: number }> {
        const response = await api.get('/chats/stats');
        return response.data;
    },

    async createNotebook(title: string): Promise<Notebook> {
        const response = await api.post('/chats/', { title });
        return response.data;
    },

    async getNotebook(id: string): Promise<ChatSessionDetail> {
        const response = await api.get(`/chats/${id}`);
        return response.data;
    },

    async sendMessage(sessionId: string, question: string, useRag: boolean = true) {
        const response = await api.post(`/chats/${sessionId}/messages`, {
            question,
            use_rag: useRag
        });
        return response.data;
    },

    async uploadFile(sessionId: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);

        // The backend expects multipart/form-data
        const response = await api.post(`/chats/${sessionId}/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    async getChatDocuments(sessionId: string) {
        const response = await api.get(`/chats/${sessionId}/documents`);
        return response.data;
    },

    async deleteDocument(sessionId: string, documentId: number) {
        await api.delete(`/chats/${sessionId}/documents/${documentId}`);
    },

    async deleteNotebook(id: number) {
        await api.delete(`/chats/${id}`);
    },

    async renameNotebook(id: number, title: string) {
        const response = await api.put(`/chats/${id}`, { title });
        return response.data;
    },

    // Summary methods
    async getDocumentChapters(sessionId: string, documentId: number): Promise<ChaptersResponse> {
        const response = await api.get(`/chats/${sessionId}/documents/${documentId}/chapters`);
        return response.data;
    },

    async summarizeDocument(
        sessionId: string,
        documentId: number,
        request: SummaryRequest
    ): Promise<SummaryResponse> {
        const response = await api.post(
            `/chats/${sessionId}/documents/${documentId}/summarize`,
            request
        );
        return response.data;
    },

    // Quiz methods
    async generateQuiz(
        sessionId: string,
        request: QuizGenerateRequest
    ): Promise<Quiz> {
        const response = await api.post(`/chats/${sessionId}/quizzes`, request);
        return response.data;
    },

    async getQuizzes(sessionId: string): Promise<QuizListResponse> {
        const response = await api.get(`/chats/${sessionId}/quizzes`);
        return response.data;
    },

    async getQuiz(sessionId: string, quizId: number): Promise<Quiz> {
        const response = await api.get(`/chats/${sessionId}/quizzes/${quizId}`);
        return response.data;
    },

    async deleteQuiz(sessionId: string, quizId: number): Promise<void> {
        await api.delete(`/chats/${sessionId}/quizzes/${quizId}`);
    }
};
