import api from './api';
import { StudioItemsResponse, StudioItem } from '@/types';

// Helper function to convert snake_case to camelCase
function mapStudioItem(item: any): StudioItem {
    return {
        id: item.id,
        type: item.type,
        title: item.title,
        status: item.status,
        itemCount: item.item_count,
        quizType: item.quiz_type,
        createdAt: item.created_at,
    };
}

export const studioService = {
    async getStudioItems(sessionId: string): Promise<StudioItemsResponse> {
        const response = await api.get(`/chats/${sessionId}/studio-items`);
        return {
            items: response.data.items.map(mapStudioItem),
            total: response.data.total,
        };
    },
};
