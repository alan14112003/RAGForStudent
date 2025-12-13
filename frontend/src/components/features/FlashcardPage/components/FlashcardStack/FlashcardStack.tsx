'use client';

import { Flashcard } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import FlashcardCard from '../FlashcardCard';
import { useAppSelector, useAppDispatch } from '@/store';
import { nextCard, prevCard, flipCard } from '@/store/features/flashcardSlice';

interface FlashcardStackProps {
    cards: Flashcard[];
}

export default function FlashcardStack({
    cards,
}: FlashcardStackProps) {
    const dispatch = useAppDispatch();
    const { currentIndex, isFlipped } = useAppSelector((state) => state.flashcard);
    const currentCard = cards[currentIndex];

    if (!currentCard) return null;

    return (
        <div className="relative w-full max-w-2xl mx-auto flex justify-center">
            {/* Left Navigation Arrow */}
            <div className="absolute top-1/2 -left-20 -translate-y-1/2 hidden md:block z-30">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dispatch(prevCard())}
                    disabled={currentIndex === 0}
                    className={cn(
                        "w-14 h-14 rounded-full shadow-lg disabled:opacity-30 transition-all",
                        "bg-white dark:bg-slate-800",
                        "text-slate-600 dark:text-white",
                        "hover:bg-violet-50 dark:hover:bg-slate-700 hover:text-violet-600 dark:hover:text-white",
                        "border border-violet-200/50 dark:border-white/10"
                    )}
                >
                    <ArrowLeft size={24} />
                </Button>
            </div>

            {/* Right Navigation Arrow */}
            <div className="absolute top-1/2 -right-20 -translate-y-1/2 hidden md:block z-30">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => dispatch(nextCard(cards.length))}
                    disabled={currentIndex === cards.length - 1}
                    className={cn(
                        "w-14 h-14 rounded-full shadow-lg disabled:opacity-30 transition-all",
                        "bg-white dark:bg-slate-800",
                        "text-slate-600 dark:text-white",
                        "hover:bg-violet-50 dark:hover:bg-slate-700 hover:text-violet-600 dark:hover:text-white",
                        "border border-violet-200/50 dark:border-white/10"
                    )}
                >
                    <ArrowRight size={24} />
                </Button>
            </div>

            {/* Card Stack Container */}
            <div className="relative w-full pb-8">
                {/* Stack Layers - Cards behind (rendered first so they appear behind) */}
                <div
                    className={cn(
                        "absolute left-1/2 w-full rounded-[32px] transition-all duration-300 z-10",
                        "bg-violet-100 dark:bg-slate-700",
                        "border border-violet-200/30 dark:border-white/10"
                    )}
                    style={{
                        height: '450px',
                        bottom: '-6px',
                        transform: 'translateX(-50%) scale(0.93)',
                    }}
                />
                <div
                    className={cn(
                        "absolute left-1/2 w-full rounded-[32px] transition-all duration-300 -z-10",
                        "bg-violet-200 dark:bg-slate-600/60",
                        "border border-violet-200/20 dark:border-white/5"
                    )}
                    style={{
                        height: '450px',
                        bottom: '-40px',
                        transform: 'translateX(-50%) scale(0.86)',
                    }}
                />

                {/* Current Card - on top */}
                <div className="relative z-20 w-full">
                    <FlashcardCard
                        frontText={currentCard.front_text}
                        backText={currentCard.back_text}
                        isFlipped={isFlipped}
                        onFlip={() => dispatch(flipCard())}
                    />
                </div>
            </div>
        </div>
    );
}
