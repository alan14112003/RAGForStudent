import api from './api';
import { FlashcardSet, FlashcardSetListResponse, FlashcardGenerateRequest } from '@/types';

export const flashcardService = {
    async generateFlashcards(
        sessionId: string,
        request: FlashcardGenerateRequest
    ): Promise<FlashcardSet> {
        const response = await api.post(`/chats/${sessionId}/flashcards`, request);
        return response.data;
    },

    async getFlashcardSets(sessionId: string): Promise<FlashcardSetListResponse> {
        const response = await api.get(`/chats/${sessionId}/flashcards`);
        return response.data;
    },

    async getFlashcardSet(sessionId: string, setId: number): Promise<FlashcardSet> {
        const response = await api.get(`/chats/${sessionId}/flashcards/${setId}`);
        return response.data;
    },

    async deleteFlashcardSet(sessionId: string, setId: number): Promise<void> {
        await api.delete(`/chats/${sessionId}/flashcards/${setId}`);
    }
};
