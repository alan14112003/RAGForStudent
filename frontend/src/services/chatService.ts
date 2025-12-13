import api from './api';
import { Notebook, ChatSessionDetail, PaginatedNotebooks } from '@/types';

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

    async deleteNotebook(id: number) {
        await api.delete(`/chats/${id}`);
    },

    async renameNotebook(id: number, title: string) {
        const response = await api.put(`/chats/${id}`, { title });
        return response.data;
    }
};
