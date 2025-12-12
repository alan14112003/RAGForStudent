'use client';

import { Flashcard } from '@/types';
import { cn } from '@/lib/utils';
import FlashcardCard from '../FlashcardCard';

interface FlashcardStackProps {
    cards: Flashcard[];
    currentIndex: number;
    isFlipped: boolean;
    onFlip: () => void;
}

export default function FlashcardStack({
    cards,
    currentIndex,
    isFlipped,
    onFlip,
}: FlashcardStackProps) {
    const currentCard = cards[currentIndex];

    // Lấy tối đa 3 thẻ để hiển thị stack effect
    const visibleStackCards = [];
    for (let i = 0; i < 3; i++) {
        const cardIndex = currentIndex + i;
        if (cardIndex < cards.length) {
            visibleStackCards.push({
                card: cards[cardIndex],
                offset: i,
            });
        }
    }

    if (!currentCard) return null;

    return (
        <div className="relative w-full" style={{ minHeight: '420px' }}>
            {/* Stack cards (phía sau) */}
            {visibleStackCards.slice().reverse().map(({ card, offset }) => {
                if (offset === 0) return null; // Skip current card

                return (
                    <div
                        key={card.id}
                        className={cn(
                            "absolute inset-0 w-full transition-all duration-300 ease-out pointer-events-none"
                        )}
                        style={{
                            transform: `translateY(${offset * 8}px) scale(${1 - offset * 0.04})`,
                            opacity: 1 - offset * 0.2,
                            zIndex: 10 - offset,
                        }}
                    >
                        <div
                            className={cn(
                                "w-full min-h-[400px] rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center text-center",
                                "bg-white dark:bg-gray-800 border-2 border-blue-200/50 dark:border-blue-800/50"
                            )}
                        >
                            {/* Preview mờ content của thẻ phía sau */}
                            <div className="opacity-30">
                                <p className="text-lg font-medium max-w-full break-words line-clamp-2">
                                    {card.front_text}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Current card (phía trước) */}
            <div
                className="relative w-full"
                style={{ zIndex: 10 }}
            >
                <FlashcardCard
                    frontText={currentCard.front_text}
                    backText={currentCard.back_text}
                    isFlipped={isFlipped}
                    onFlip={onFlip}
                />
            </div>

            {/* Stack indicator */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
                {cards.map((_, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            idx === currentIndex
                                ? "bg-blue-500 scale-125"
                                : idx < currentIndex
                                    ? "bg-blue-300 dark:bg-blue-700"
                                    : "bg-gray-300 dark:bg-gray-600"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}
