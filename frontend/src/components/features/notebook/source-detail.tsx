'use client';
import { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, FileText, Calendar } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


interface SourceDetailProps {
  source: {
    id: number;
    name: string;
    type: string;
    date: string;
    content?: string;
  } | null;
  onClose: () => void;
  highlightRange?: {
      start: number;
      end: number;
  };
}

export default function SourceDetail({ source, onClose, highlightRange }: SourceDetailProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const highlightRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (highlightRange && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightRange, source]);

  if (!source) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText size={32} className="opacity-50" />
        </div>
        <h3 className="font-semibold text-lg mb-2">No Source Selected</h3>
        <p className="text-sm">Select a source from the list to view its details here.</p>
      </div>
    );
  }

  // Helper to render content with highlight
  const renderContent = () => {
      if (!source.content) return <p className="italic text-muted-foreground">No content available for this source.</p>;

      const markdownComponents = {
          // Flatten paragraphs to spans inside highlights to avoid invalid HTML (block inside inline)
          // or just generally to keep flow if needed. But for "before" and "after" blocks, standard p is fine.
          // For the highlighted part, we definitely want it to be inline if possible, or at least not break the mark tag.
          // However, mark is inline. <p> inside <mark> is invalid.
          // So for the highlighted chunk, we force p -> span.
      };

      if (!highlightRange) {
          return (
            <div className="whitespace-pre-wrap leading-relaxed text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {source.content}
                </ReactMarkdown>
            </div>
          );
      }

      const { start, end } = highlightRange;
      if (start < 0 || end > source.content.length || start >= end) {
           return (
            <div className="whitespace-pre-wrap leading-relaxed text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {source.content}
                </ReactMarkdown>
            </div>
           );
      }

      const before = source.content.substring(0, start);
      const highlighted = source.content.substring(start, end);
      const after = source.content.substring(end);

      return (
          <div className="whitespace-pre-wrap leading-relaxed text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({node, ...props}) => <span {...props} className="block mb-2" /> }}>
                {before}
              </ReactMarkdown>
              
              <mark ref={highlightRef} className="bg-indigo-300 dark:bg-indigo-600/50 rounded-sm px-0.5 text-black dark:text-white font-medium inline-block">
                 <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    components={{ 
                        p: ({node, ...props}) => <span {...props} />,
                        // Ensure other block elements don't break the layout too much inside a mark
                    }}
                 >
                    {highlighted}
                 </ReactMarkdown>
              </mark>

              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({node, ...props}) => <span {...props} className="block mb-2" /> }}>
                {after}
              </ReactMarkdown>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-background border-l">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3 overflow-hidden">
           <div className="h-8 w-8 rounded bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 shrink-0">
             <FileText size={16} />
           </div>
           <div className="min-w-0">
             <h2 className="font-semibold text-sm truncate" title={source.name}>{source.name}</h2>
             <span className="text-xs text-muted-foreground flex items-center gap-1">
               <Calendar size={10} /> {source.date}
             </span>
           </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X size={16} />
        </Button>
      </div>
      
      <ScrollArea className="flex-1 p-6 min-h-0" ref={scrollAreaRef}>
        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
            {renderContent()}
        </div>
      </ScrollArea>
    </div>
  );
}

