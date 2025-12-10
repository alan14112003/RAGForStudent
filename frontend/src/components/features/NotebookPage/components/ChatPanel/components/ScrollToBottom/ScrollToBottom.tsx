'use client';

import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollToBottomProps {
    onClick: () => void;
}

export default function ScrollToBottom({ onClick }: ScrollToBottomProps) {
    return (
        <Button
            onClick={onClick}
            className={cn(
                "absolute left-1/2 -translate-x-1/2 bottom-6 z-50",
                "h-10 w-10 rounded-full",
                "bg-gradient-to-r from-indigo-500 to-purple-600",
                "hover:from-indigo-600 hover:to-purple-700",
                "shadow-lg shadow-indigo-500/30",
                "transition-all duration-300 ease-out",
                "hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/40",
                "animate-in fade-in slide-in-from-bottom-4 duration-300",
                "flex items-center justify-center",
                "border border-white/20"
            )}
            size="icon"
            aria-label="Scroll to bottom"
        >
            <ArrowDown className="h-5 w-5 text-white" />
        </Button>
    );
}
