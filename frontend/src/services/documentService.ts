import api from './api';
import { SummaryRequest, SummaryResponse, ChaptersResponse } from '@/types';

export const documentService = {
    async uploadFile(sessionId: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);

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
    }
};
