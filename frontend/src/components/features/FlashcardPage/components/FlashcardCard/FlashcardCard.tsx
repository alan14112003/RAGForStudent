'use client';

import { cn } from '@/lib/utils';
import { MousePointerClick } from 'lucide-react';

interface FlashcardCardProps {
    frontText: string;
    backText: string;
    isFlipped: boolean;
    onFlip: () => void;
    className?: string;
    showHint?: boolean;
}

export default function FlashcardCard({
    frontText,
    backText,
    isFlipped,
    onFlip,
    className,
    showHint = true,
}: FlashcardCardProps) {
    return (
        <div
            onClick={onFlip}
            className={cn(
                "relative w-full min-h-[450px] cursor-pointer transition-transform duration-500",
                className
            )}
            style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
        >
            {/* Front */}
            <div
                className={cn(
                    "absolute inset-0 w-full h-full rounded-[32px] p-10 flex flex-col items-center justify-center text-center",
                    "bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm",
                    "shadow-xl shadow-violet-200/50 dark:shadow-black/30",
                    "border border-violet-200/50 dark:border-white/10"
                )}
                style={{ backfaceVisibility: 'hidden' }}
            >
                <div className="flex-1 flex items-center justify-center w-full">
                    <p className="text-slate-800 dark:text-white text-2xl md:text-3xl font-medium leading-relaxed max-w-full wrap-break-word">
                        {frontText}
                    </p>
                </div>

                {showHint && (
                    <div className="mt-8 text-sm text-slate-400 dark:text-white/40 flex items-center gap-2">
                        <span>Xem đáp án</span>
                        <MousePointerClick size={16} />
                    </div>
                )}
            </div>

            {/* Back */}
            <div
                className={cn(
                    "absolute inset-0 w-full h-full rounded-[32px] p-10 flex flex-col items-center justify-center text-center",
                    "bg-linear-to-br from-violet-500 to-indigo-600 dark:from-violet-600 dark:to-indigo-700",
                    "shadow-xl shadow-violet-300/50 dark:shadow-black/30",
                    "border border-violet-400/30 dark:border-white/10"
                )}
                style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                }}
            >
                <div className="flex-1 flex items-center justify-center w-full">
                    <p className="text-white text-2xl md:text-3xl font-medium leading-relaxed max-w-full wrap-break-word">
                        {backText}
                    </p>
                </div>

                {showHint && (
                    <div className="mt-8 text-sm text-white/60 flex items-center gap-2">
                        <span>Xem câu hỏi</span>
                        <MousePointerClick size={16} />
                    </div>
                )}
            </div>
        </div>
    );
}
