'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Loader2, XCircle } from 'lucide-react';
import { queryKeys } from '@/lib/queryKeys';
import { flashcardService } from '@/services/flashcardService';
import { FlashcardSet } from '@/types';
import FlashcardHeader from './components/FlashcardHeader';
import FlashcardStack from './components/FlashcardStack';
import FlashcardControls from './components/FlashcardControls';

interface FlashcardPageProps {
    sessionId: string;
    flashcardId: number;
}

export default function FlashcardPage({ sessionId, flashcardId }: FlashcardPageProps) {
    const router = useRouter();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());

    // Fetch flashcard set with cards
    const { data: flashcardSet, isLoading, error } = useQuery<FlashcardSet>({
        queryKey: queryKeys.notebooks.flashcard(sessionId, flashcardId),
        queryFn: () => flashcardService.getFlashcardSet(sessionId, flashcardId),
        enabled: !!sessionId && !!flashcardId,
    });

    const cards = flashcardSet?.cards || [];
    const currentCard = cards[currentIndex];
    const isFirstCard = currentIndex === 0;
    const isLastCard = currentIndex === cards.length - 1;

    const handleFlip = useCallback(() => {
        setIsFlipped(!isFlipped);
        if (!isFlipped && currentCard) {
            setStudiedCards((prev) => new Set(prev).add(currentCard.id));
        }
    }, [isFlipped, currentCard]);

    const handleNext = useCallback(() => {
        if (!isLastCard) {
            setCurrentIndex((prev) => prev + 1);
            setIsFlipped(false);
        }
    }, [isLastCard]);

    const handlePrev = useCallback(() => {
        if (!isFirstCard) {
            setCurrentIndex((prev) => prev - 1);
            setIsFlipped(false);
        }
    }, [isFirstCard]);

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setStudiedCards(new Set());
    };

    const handleBackToNotebook = () => {
        router.push(`/notebook/${sessionId}`);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                handleFlip();
            } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
                handleNext();
            } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
                handlePrev();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleFlip, handleNext, handlePrev]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={48} />
                    <p className="text-muted-foreground">Đang tải flashcard...</p>
                </div>
            </div>
        );
    }

    if (error || !flashcardSet) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <XCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h3 className="text-lg font-semibold mb-2">Không thể tải flashcard</h3>
                    <p className="text-muted-foreground mb-4">Flashcard không tồn tại hoặc đã bị xóa.</p>
                    <Button onClick={handleBackToNotebook}>
                        <ArrowLeft className="mr-2" size={16} />
                        Quay lại notebook
                    </Button>
                </div>
            </div>
        );
    }

    if (flashcardSet.status !== 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <Loader2 className="mx-auto animate-spin text-blue-500 mb-4" size={48} />
                    <h3 className="text-lg font-semibold mb-2">Flashcard đang được tạo</h3>
                    <p className="text-muted-foreground mb-4">Vui lòng đợi trong giây lát...</p>
                    <Button variant="outline" onClick={handleBackToNotebook}>
                        <ArrowLeft className="mr-2" size={16} />
                        Quay lại và đợi
                    </Button>
                </div>
            </div>
        );
    }

    // Flashcard study view
    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
            <FlashcardHeader
                title={flashcardSet.title}
                currentIndex={currentIndex}
                totalCards={cards.length}
                onBack={handleBackToNotebook}
            />

            <ScrollArea className="h-[calc(100vh-150px)]">
                <div className="p-4 pt-0">
                    <div className="max-w-3xl mx-auto">
                        {/* Flashcard Stack */}
                        <div className="py-4">
                            <FlashcardStack
                                cards={cards}
                                currentIndex={currentIndex}
                                isFlipped={isFlipped}
                                onFlip={handleFlip}
                            />
                        </div>

                        {/* Controls */}
                        <div className="mt-10">
                            <FlashcardControls
                                isFirstCard={isFirstCard}
                                isLastCard={isLastCard}
                                onPrev={handlePrev}
                                onNext={handleNext}
                                onFlip={handleFlip}
                                onRestart={handleRestart}
                                onComplete={handleBackToNotebook}
                            />
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
