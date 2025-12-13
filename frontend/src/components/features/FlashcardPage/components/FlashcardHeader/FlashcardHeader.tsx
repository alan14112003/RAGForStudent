'use client';

import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FlashcardHeaderProps {
    title: string;
    onBack: () => void;
}

export default function FlashcardHeader({
    title,
    onBack,
}: FlashcardHeaderProps) {
    return (
        <div className="shrink-0 p-6 flex items-center justify-between z-50 relative">
            <div>
                <h1 className="text-slate-800 dark:text-white text-xl font-semibold">Thông tin Flashcard</h1>
                <p className="text-slate-500 dark:text-white/50 text-sm">Dựa trên {title}</p>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="text-slate-500 dark:text-white/70 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full"
                >
                    <X size={24} />
                </Button>
            </div>
        </div>
    );
}
