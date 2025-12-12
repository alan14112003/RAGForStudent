'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';

interface FlashcardHeaderProps {
    title: string;
    currentIndex: number;
    totalCards: number;
    onBack: () => void;
}

export default function FlashcardHeader({
    title,
    currentIndex,
    totalCards,
    onBack,
}: FlashcardHeaderProps) {
    const progressPercentage = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

    return (
        <div className="shrink-0 p-4 pb-0">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                    <Button variant="ghost" size="sm" onClick={onBack}>
                        <ArrowLeft className="mr-2" size={16} />
                        Thoát
                    </Button>
                    <div className="text-center">
                        <h2
                            className="font-semibold text-sm truncate max-w-[200px]"
                            title={title}
                        >
                            {title}
                        </h2>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                        {currentIndex + 1} / {totalCards}
                    </Badge>
                </div>
                <Progress value={progressPercentage} className="mb-4 h-2" />
            </div>
        </div>
    );
}
