import api from './api';
import { Quiz, QuizListResponse, QuizGenerateRequest } from '@/types';

export const quizService = {
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
