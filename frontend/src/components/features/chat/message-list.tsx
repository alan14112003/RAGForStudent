'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Citation, Message, UserInfo } from '@/types';
import MessageItem from './MessageItem';
import { ArrowDown } from 'lucide-react';

// Re-export for backward compatibility
export type { Citation, UserInfo, Message };

interface MessageListProps {
    messages: Message[];
    isLoading?: boolean;
    onCitationClick?: (citation: Citation) => void;
    className?: string;
    userInfo?: UserInfo;
}

export default function MessageList({ messages, isLoading, onCitationClick, className, userInfo }: MessageListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [viewportEl, setViewportEl] = useState<HTMLElement | null>(null);
    const prevMessageLengthRef = useRef<number>(0);
    const hasInitialScrollRef = useRef<boolean>(false);

    // Get viewport element on mount
    useEffect(() => {
        const findViewport = () => {
            if (containerRef.current) {
                const viewport = containerRef.current.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
                if (viewport) {
                    setViewportEl(viewport);
                    return true;
                }
            }
            return false;
        };

        // Try immediately
        if (!findViewport()) {
            // Retry after a short delay if not found
            const timer = setTimeout(findViewport, 100);
            return () => clearTimeout(timer);
        }
    }, []);

    // Scroll to bottom function
    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
        if (viewportEl) {
            viewportEl.scrollTo({
                top: viewportEl.scrollHeight,
                behavior: behavior
            });
        } else if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior });
        }
    }, [viewportEl]);

    // Check if user is near bottom (within 100px)
    const checkScrollPosition = useCallback(() => {
        if (viewportEl) {
            const { scrollTop, scrollHeight, clientHeight } = viewportEl;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            setShowScrollButton(distanceFromBottom > 100);
        }
    }, [viewportEl]);

    // Auto-scroll to bottom when messages change or on initial load
    useEffect(() => {
        if (!viewportEl) return;

        const currentLength = messages.length;
        const prevLength = prevMessageLengthRef.current;

        // Scroll to bottom if:
        // 1. Initial load (messages went from 0 to something)
        // 2. New messages arrived
        // 3. First time we have both viewport and messages
        const shouldScroll =
            (prevLength === 0 && currentLength > 0) || // Initial load
            (currentLength > prevLength) || // New message
            (!hasInitialScrollRef.current && currentLength > 0); // First scroll after viewport ready

        if (shouldScroll) {
            // Use requestAnimationFrame + setTimeout for more reliable scroll timing
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (viewportEl) {
                        viewportEl.scrollTo({
                            top: viewportEl.scrollHeight,
                            behavior: 'instant' as ScrollBehavior
                        });
                        hasInitialScrollRef.current = true;
                    }
                }, 50);
            });
        }

        prevMessageLengthRef.current = currentLength;
    }, [messages.length, viewportEl]);

    // Setup scroll event listener
    useEffect(() => {
        if (viewportEl) {
            const handleScroll = () => checkScrollPosition();
            viewportEl.addEventListener('scroll', handleScroll, { passive: true });
            checkScrollPosition(); // Initial check
            return () => viewportEl.removeEventListener('scroll', handleScroll);
        }
    }, [viewportEl, checkScrollPosition]);

    return (
        <div ref={containerRef} className="relative flex-1 flex flex-col overflow-hidden">
            <ScrollArea className={cn("flex-1 p-4", className)}>
                <div className="space-y-4 max-w-3xl mx-auto">
                    {messages.map((msg) => (
                        <MessageItem
                            key={msg.id}
                            message={msg}
                            onCitationClick={onCitationClick}
                            userInfo={userInfo}
                        />
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                            <Avatar className="h-8 w-8"><AvatarFallback>AI</AvatarFallback></Avatar>
                            <div className="bg-white border dark:bg-gray-800 rounded-lg p-3">
                                <span className="animate-pulse">Thinking...</span>
                            </div>
                        </div>
                    )}
                    {/* Invisible element to scroll to */}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            {/* Scroll to bottom button */}
            {showScrollButton && (
                <Button
                    onClick={() => scrollToBottom('smooth')}
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
            )}
        </div>
    );
}

