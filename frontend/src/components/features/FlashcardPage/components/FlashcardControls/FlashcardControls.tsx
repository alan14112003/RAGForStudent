import { Button } from '@/components/ui/button';
import { RotateCcw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { resetFlashcardState, setIndex } from '@/store/features/flashcardSlice';
import { Slider } from '@/components/ui/slider';

interface FlashcardControlsProps {
    totalCards: number;
}

export default function FlashcardControls({
    totalCards,
}: FlashcardControlsProps) {
    const dispatch = useAppDispatch();
    const currentIndex = useAppSelector((state) => state.flashcard.currentIndex);

    return (
        <div className="w-full max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
            {/* Left: Restart */}
            <div className="flex-1 flex justify-start">
                <Button
                    variant="ghost"
                    onClick={() => dispatch(resetFlashcardState())}
                    className={cn(
                        "flex flex-col items-center gap-1 h-auto py-2 transition-colors",
                        "text-slate-600 dark:text-white/80",
                        "hover:bg-violet-50 dark:hover:bg-white/10",
                        "hover:text-violet-600 dark:hover:text-white"
                    )}
                >
                    <RotateCcw size={20} />
                    <span className="text-xs">Restart</span>
                </Button>
            </div>

            {/* Center: Slider & Count */}
            <div className="flex-2 flex items-center gap-4 w-full">
                <Slider
                    defaultValue={[0]}
                    value={[currentIndex]}
                    max={totalCards - 1}
                    step={1}
                    onValueChange={(val) => dispatch(setIndex(val[0]))}
                    className="w-full [&>.relative>.absolute]:bg-violet-500"
                    isShowThumb={false}
                />
                <span className="shrink-0 text-sm font-medium text-slate-600 dark:text-white/80 whitespace-nowrap">
                    {currentIndex + 1} / {totalCards} cards
                </span>
            </div>

            {/* Right: Download (Mock) */}
            <div className="flex-1 flex justify-end">
                <Button
                    variant="ghost"
                    className={cn(
                        "flex flex-col items-center gap-1 h-auto py-2 transition-colors",
                        "text-slate-600 dark:text-white/80",
                        "hover:bg-violet-50 dark:hover:bg-white/10",
                        "hover:text-violet-600 dark:hover:text-white"
                    )}
                >
                    <Download size={20} />
                    <span className="text-xs">Download</span>
                </Button>
            </div>
        </div>
    );
}
