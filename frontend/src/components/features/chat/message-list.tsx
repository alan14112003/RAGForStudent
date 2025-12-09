'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface Citation {
  id: string;
  sourceName: string;
  sourceId: string; // "S1", "S2", etc.
  documentId?: string;
  page?: number;
  highlightRange?: {
      start: number;
      end: number;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  createdAt: Date;
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onCitationClick?: (citation: Citation) => void;
  className?: string; // [NEW] Allow external styling
}

export default function MessageList({ messages, isLoading, onCitationClick, className }: MessageListProps) {
  // Function to render content with clickable citations using Markdown
  const renderMessageContent = (msg: Message) => {
      if (msg.role === 'user') return <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>;

      // Pre-process content: convert [S1], [S2] into inline code `citation:S1`
      // This avoids link behavior issues and uses custom code component to render
      const processedContent = msg.content
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
                                        const citation = msg.citations?.find(c => c.sourceId === sourceId);
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
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
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
    <ScrollArea className={cn("flex-1 p-4", className)}>
      <div className="space-y-4 max-w-3xl mx-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3',
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback>{msg.role === 'user' ? 'U' : 'AI'}</AvatarFallback>
              {msg.role === 'assistant' && <AvatarImage src="/bot-avatar.png" />}
            </Avatar>

            <div
              className={cn(
                'rounded-lg p-3 max-w-[80%] text-sm',
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border dark:bg-gray-800'
              )}
            >
              {renderMessageContent(msg)}
              
              {/* Fallback sources list if needed, or remove if inline is enough */}
              {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-semibold opacity-70">References:</span>
                  {msg.citations.map((cite) => (
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
        ))}

        {isLoading && (
           <div className="flex gap-3">
             <Avatar className="h-8 w-8"><AvatarFallback>AI</AvatarFallback></Avatar>
             <div className="bg-white border dark:bg-gray-800 rounded-lg p-3">
               <span className="animate-pulse">Thinking...</span>
             </div>
           </div>
        )}
      </div>
    </ScrollArea>
  );
}

