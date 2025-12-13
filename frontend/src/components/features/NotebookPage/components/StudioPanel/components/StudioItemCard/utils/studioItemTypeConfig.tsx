// Studio item type configuration
// Extensible config for different studio item types (quiz, flashcard, future types)

import { ReactNode } from 'react';
import { BookOpen, Layers } from 'lucide-react';
import { StudioItemType } from '@/types';

export interface StudioItemTypeConfig {
    icon: ReactNode;
    iconClassName: string;
    containerClassName: string;
    itemCountLabel: string;
    deleteConfirmMessage: string;
    getDetailPath: (sessionId: string, itemId: number) => string;
}

// Registry pattern: add new types here when scaling
export const studioItemTypeRegistry: Record<StudioItemType, StudioItemTypeConfig> = {
    quiz: {
        icon: <BookOpen size={16} />,
        iconClassName: 'text-purple-600',
        containerClassName: 'bg-linear-to-br from-purple-500/20 to-pink-500/20',
        itemCountLabel: 'questions',
        deleteConfirmMessage: 'Are you sure you want to delete this quiz?',
        getDetailPath: (sessionId, itemId) => `/notebook/${sessionId}/quiz/${itemId}`,
    },
    flashcard: {
        icon: <Layers size={16} />,
        iconClassName: 'text-blue-600',
        containerClassName: 'bg-linear-to-br from-blue-500/20 to-cyan-500/20',
        itemCountLabel: 'cards',
        deleteConfirmMessage: 'Are you sure you want to delete this flashcard set?',
        getDetailPath: (sessionId, itemId) => `/notebook/${sessionId}/flashcard/${itemId}`,
    },
};

/**
 * Get config for a studio item type
 * Returns undefined for unknown types (defensive coding)
 */
export function getStudioItemTypeConfig(type: StudioItemType): StudioItemTypeConfig | undefined {
    return studioItemTypeRegistry[type];
}
