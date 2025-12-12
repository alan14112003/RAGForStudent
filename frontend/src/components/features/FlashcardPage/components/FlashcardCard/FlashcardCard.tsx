'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
        <div className={cn("perspective-1000", className)}>
            <div
                onClick={onFlip}
                className="relative w-full min-h-[400px] cursor-pointer transition-transform duration-500"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
            >
                {/* Front */}
                <div
                    className={cn(
                        "absolute inset-0 w-full h-full rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-center",
                        "bg-white dark:bg-gray-800 border-2 border-blue-200 dark:border-blue-800"
                    )}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <Badge className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        Mặt trước - Câu hỏi
                    </Badge>
                    <p className="text-xl font-medium leading-relaxed max-w-full break-words">
                        {frontText}
                    </p>
                    {showHint && (
                        <p className="mt-6 text-sm text-muted-foreground">
                            Nhấn để xem đáp án (hoặc Space)
                        </p>
                    )}
                </div>

                {/* Back */}
                <div
                    className={cn(
                        "absolute inset-0 w-full h-full rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-center",
                        "bg-gradient-to-br from-blue-500 to-cyan-500 text-white"
                    )}
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                    }}
                >
                    <Badge className="mb-4 bg-white/20 text-white">
                        Mặt sau - Đáp án
                    </Badge>
                    <p className="text-xl font-medium leading-relaxed max-w-full break-words">
                        {backText}
                    </p>
                    {showHint && (
                        <p className="mt-6 text-sm text-white/70">
                            Nhấn để xem câu hỏi
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
