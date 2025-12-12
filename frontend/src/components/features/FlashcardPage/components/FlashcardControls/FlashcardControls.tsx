'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, RotateCcw, Home, RefreshCw } from 'lucide-react';

interface FlashcardControlsProps {
    isFirstCard: boolean;
    isLastCard: boolean;
    onPrev: () => void;
    onNext: () => void;
    onFlip: () => void;
    onRestart: () => void;
    onComplete: () => void;
}

export default function FlashcardControls({
    isFirstCard,
    isLastCard,
    onPrev,
    onNext,
    onFlip,
    onRestart,
    onComplete,
}: FlashcardControlsProps) {
    return (
        <div className="space-y-6">
            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={onPrev}
                    disabled={isFirstCard}
                    className="gap-2"
                >
                    <ArrowLeft size={16} />
                    Trước
                </Button>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onFlip}
                        title="Lật thẻ (Space)"
                    >
                        <RefreshCw size={18} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onRestart}
                        title="Làm lại từ đầu"
                    >
                        <RotateCcw size={18} />
                    </Button>
                </div>

                {isLastCard ? (
                    <Button onClick={onComplete} className="gap-2 bg-blue-500 hover:bg-blue-600">
                        <Home size={16} />
                        Hoàn thành
                    </Button>
                ) : (
                    <Button onClick={onNext} className="gap-2 bg-blue-500 hover:bg-blue-600">
                        Tiếp
                        <ArrowRight size={16} />
                    </Button>
                )}
            </div>

            {/* Keyboard hints */}
            <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                <span><kbd className="px-1.5 py-0.5 bg-muted rounded">Space</kbd> Lật thẻ</span>
                <span><kbd className="px-1.5 py-0.5 bg-muted rounded">←</kbd> Trước</span>
                <span><kbd className="px-1.5 py-0.5 bg-muted rounded">→</kbd> Tiếp</span>
            </div>
        </div>
    );
}
