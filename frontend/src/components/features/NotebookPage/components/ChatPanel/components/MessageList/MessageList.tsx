'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Citation, Message, UserInfo } from '@/types';
import MessageItem from './components/MessageItem';
import ScrollToBottom from '../ScrollToBottom';

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

        if (!findViewport()) {
            const timer = setTimeout(findViewport, 100);
            return () => clearTimeout(timer);
        }
    }, []);

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

    const checkScrollPosition = useCallback(() => {
        if (viewportEl) {
            const { scrollTop, scrollHeight, clientHeight } = viewportEl;
            const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
            setShowScrollButton(distanceFromBottom > 100);
        }
    }, [viewportEl]);

    useEffect(() => {
        if (!viewportEl) return;

        const currentLength = messages.length;
        const prevLength = prevMessageLengthRef.current;

        const shouldScroll =
            (prevLength === 0 && currentLength > 0) ||
            (currentLength > prevLength) ||
            (!hasInitialScrollRef.current && currentLength > 0);

        if (shouldScroll) {
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

    useEffect(() => {
        if (viewportEl) {
            const handleScroll = () => checkScrollPosition();
            viewportEl.addEventListener('scroll', handleScroll, { passive: true });
            checkScrollPosition();
            return () => viewportEl.removeEventListener('scroll', handleScroll);
        }
    }, [viewportEl, checkScrollPosition]);

    return (
        <div ref={containerRef} className="relative flex-1 flex flex-col overflow-hidden">
            <ScrollArea className={cn("flex-1 p-4", className)}>
                <div className="space-y-4 w-full">
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
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>

            {showScrollButton && (
                <ScrollToBottom onClick={() => scrollToBottom('smooth')} />
            )}
        </div>
    );
}
