'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { getInitials } from '@/lib/helpers';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Citation, Message, UserInfo } from '@/types';

interface MessageItemProps {
    message: Message;
    onCitationClick?: (citation: Citation) => void;
    userInfo?: UserInfo;
}

export default function MessageItem({ message, onCitationClick, userInfo }: MessageItemProps) {
    // Function to render content with clickable citations using Markdown
    const renderMessageContent = () => {
        if (message.role === 'user') {
            return <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>;
        }

        // Pre-process content: convert [S1], [S2] into inline code `citation:S1`
        // This avoids link behavior issues and uses custom code component to render
        const processedContent = message.content
            .replace(/\[(S\d+(?:,\s*S\d+)*)\]/g, '`citation:$1`');

        return (
            <div className="leading-relaxed markdown-content">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                        // Custom code component to handle citations
                        code: ({ node, className, children, ...props }) => {
                            const content = String(children).replace(/\n$/, '');

                            // Check if this is a citation code
                            if (content.startsWith('citation:')) {
                                const sourceIds = content.replace('citation:', '').split(',').map(s => s.trim());
                                return (
                                    <>
                                        {sourceIds.map((sourceId, idx) => {
                                            const citation = message.citations?.find(c => c.sourceId === sourceId);
                                            return (
                                                <button
                                                    type="button"
                                                    key={`${sourceId}-${idx}`}
                                                    className="inline-flex items-center px-1.5 py-0 text-[10px] cursor-pointer bg-secondary text-secondary-foreground hover:bg-primary/20 transition-colors mx-0.5 rounded-full border-0"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        if (citation) onCitationClick?.(citation);
                                                    }}
                                                    title={citation ? citation.sourceName : "Source"}
                                                >
                                                    {sourceId}
                                                </button>
                                            );
                                        })}
                                    </>
                                );
                            }

                            // Regular code rendering
                            const isInline = !className;
                            return isInline
                                ? <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>{children}</code>
                                : <code className={cn("block bg-muted p-2 rounded text-sm overflow-x-auto", className)} {...props}>{children}</code>;
                        },
                        // Ensure lists render correctly with proper styling
                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                        // Default link rendering
                        a: ({ node, href, children, ...props }) => (
                            <a href={href} className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                        ),
                    }}
                >
                    {processedContent}
                </ReactMarkdown>
            </div>
        );
    };

    return (
        <div
            className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
        >
            <Avatar className="h-8 w-8">
                {message.role === 'user' && userInfo?.picture && <AvatarImage src={userInfo.picture} alt={userInfo.name || 'User'} />}
                {message.role === 'assistant' && <AvatarImage src="/bot-avatar.png" />}
                <AvatarFallback>{message.role === 'user' ? getInitials(userInfo?.name) : 'AI'}</AvatarFallback>
            </Avatar>

            <div
                className={cn(
                    'rounded-lg p-3 max-w-[80%] text-sm',
                    message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border dark:bg-gray-800'
                )}
            >
                {renderMessageContent()}

                {/* Fallback sources list if needed, or remove if inline is enough */}
                {message.role === 'assistant' && message.citations && message.citations.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs font-semibold opacity-70">References:</span>
                        {message.citations.map((cite) => (
                            <div
                                key={cite.id}
                                className="text-xs text-muted-foreground flex items-center gap-1 cursor-pointer hover:underline"
                                onClick={() => onCitationClick?.(cite)}
                            >
                                <span className="font-mono bg-muted px-1 rounded text-[10px]">{cite.sourceId}</span>
                                <span className="truncate max-w-[150px]">{cite.sourceName}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
