'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { SummaryResponse } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { List, FileText, Table2 } from 'lucide-react';

interface SummaryResultProps {
    summary: SummaryResponse | null;
}

const formatLabels = {
    bullet: { label: 'Bullet Points', icon: List },
    executive: { label: 'Executive Summary', icon: FileText },
    table: { label: 'Summary Table', icon: Table2 },
};

const scopeLabels = {
    full: 'Full Document',
    chapter: 'By Chapter',
};

export default function SummaryResult({ summary }: SummaryResultProps) {
    if (!summary) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-amber-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                    Select options and press &quot;Generate Summary&quot; to start
                </p>
            </div>
        );
    }

    const FormatIcon = formatLabels[summary.format]?.icon || FileText;

    return (
        <div className="space-y-3">
            {/* Summary metadata */}
            <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                    <FormatIcon className="h-3 w-3" />
                    {formatLabels[summary.format]?.label}
                </Badge>
                <Badge variant="outline">
                    {scopeLabels[summary.scope]}
                </Badge>
                {summary.chapter_title && (
                    <Badge variant="outline" className="bg-primary/10">
                        {summary.chapter_title}
                    </Badge>
                )}
            </div>

            {/* Summary content */}
            <ScrollArea className="max-h-[400px]">
                <div className="prose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            // Custom table styling for better appearance
                            table: ({ children }) => (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse border border-border text-sm">
                                        {children}
                                    </table>
                                </div>
                            ),
                            th: ({ children }) => (
                                <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">
                                    {children}
                                </th>
                            ),
                            td: ({ children }) => (
                                <td className="border border-border px-3 py-2">
                                    {children}
                                </td>
                            ),
                        }}
                    >
                        {summary.summary}
                    </ReactMarkdown>
                </div>
            </ScrollArea>
        </div>
    );
}
