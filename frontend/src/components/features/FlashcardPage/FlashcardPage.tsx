'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, XCircle } from 'lucide-react';
import { queryKeys } from '@/lib/queryKeys';
import { flashcardService } from '@/services/flashcardService';
import { FlashcardSet } from '@/types';
import FlashcardHeader from './components/FlashcardHeader';
import FlashcardStack from './components/FlashcardStack';
import FlashcardControls from './components/FlashcardControls';
import { useAppDispatch } from '@/store';
import { resetFlashcardState, nextCard, prevCard, flipCard } from '@/store/features/flashcardSlice';

interface FlashcardPageProps {
    sessionId: string;
    flashcardId: number;
}

export default function FlashcardPage({ sessionId, flashcardId }: FlashcardPageProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // Fetch flashcard set with cards
    const { data: flashcardSet, isLoading, error } = useQuery<FlashcardSet>({
        queryKey: queryKeys.notebooks.flashcard(sessionId, flashcardId),
        queryFn: () => flashcardService.getFlashcardSet(sessionId, flashcardId),
        enabled: !!sessionId && !!flashcardId,
    });

    const cards = flashcardSet?.cards || [];

    // Reset state on unmount or when sessionId/flashcardId changes
    useEffect(() => {
        return () => {
            dispatch(resetFlashcardState());
        };
    }, [dispatch, sessionId, flashcardId]);

    const handleBackToNotebook = () => {
        router.push(`/notebook/${sessionId}`);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                dispatch(flipCard());
            } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                dispatch(nextCard(cards.length));
            } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                dispatch(prevCard());
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [dispatch, cards]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-linear-to-br from-violet-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-gray-900 dark:to-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-violet-500" size={48} />
                    <p className="text-slate-600 dark:text-white/70">Đang tải flashcard...</p>
                </div>
            </div>
        );
    }

    if (error || !flashcardSet) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-linear-to-br from-violet-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-gray-900 dark:to-slate-950">
                <div className="text-center">
                    <XCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">Không thể tải flashcard</h3>
                    <Button onClick={handleBackToNotebook} variant="secondary">
                        Quay lại notebook
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col bg-linear-to-br from-violet-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-gray-900 dark:to-slate-950 relative overflow-hidden">
            {/* Background Glow Effects - Improved visual ambiance */}
            <div className="absolute top-1/4 -left-64 w-[600px] h-[600px] bg-violet-300/30 dark:bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-64 w-[600px] h-[600px] bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <FlashcardHeader
                title={flashcardSet.title || "Tài liệu"}
                onBack={handleBackToNotebook}
            />

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <FlashcardStack cards={cards} />
            </div>

            {/* Bottom Controls */}
            <div className="shrink-0 pb-6 z-50">
                <FlashcardControls totalCards={cards.length} />
            </div>
        </div>
    );
}
