'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { List, FileText, Table2, Loader2, Check } from 'lucide-react';
import { SummaryScope, SummaryFormat, ChapterInfo } from '@/types';

interface SummaryOptionsProps {
    chapters: ChapterInfo[];
    isLoadingChapters: boolean;
    onSummarize: (scope: SummaryScope, format: SummaryFormat, chapterIndices?: number[]) => void;
    isGenerating: boolean;
    onScopeChange?: (scope: SummaryScope) => void;
}

const formatOptions = [
    { value: 'bullet' as SummaryFormat, label: 'Bullet Points', icon: List, description: 'Key points' },
    { value: 'executive' as SummaryFormat, label: 'Executive', icon: FileText, description: 'Executive summary' },
    { value: 'table' as SummaryFormat, label: 'Table', icon: Table2, description: 'Summary table' },
];

export default function SummaryOptions({
    chapters,
    isLoadingChapters,
    onSummarize,
    isGenerating,
    onScopeChange
}: SummaryOptionsProps) {
    const [scope, setScope] = useState<SummaryScope>('full');
    const [format, setFormat] = useState<SummaryFormat>('bullet');
    const [selectedChapters, setSelectedChapters] = useState<number[]>([]);

    const handleSummarize = () => {
        onSummarize(
            scope,
            format,
            scope === 'chapter' ? selectedChapters : undefined
        );
    };

    const toggleChapter = (index: number) => {
        setSelectedChapters(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const selectAllChapters = () => {
        if (selectedChapters.length === chapters.length) {
            setSelectedChapters([]);
        } else {
            setSelectedChapters(chapters.map(c => c.index));
        }
    };

    return (
        <div className="space-y-4">
            {/* Scope Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Scope</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => {
                            setScope('full');
                            onScopeChange?.('full');
                        }}
                        className={`
                            flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all text-sm
                            ${scope === 'full'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                            }
                        `}
                    >
                        <FileText className="h-4 w-4" />
                        Full Document
                    </button>
                    <button
                        onClick={() => {
                            setScope('chapter');
                            onScopeChange?.('chapter');
                        }}
                        className={`
                            flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all text-sm
                            ${scope === 'chapter'
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                            }
                        `}
                    >
                        <List className="h-4 w-4" />
                        By Chapter/Section
                    </button>
                </div>
            </div>

            {/* Chapter Selection (only if scope is chapter) */}
            {scope === 'chapter' && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                            Select Chapters/Sections ({selectedChapters.length} selected)
                        </label>
                        {chapters.length > 0 && (
                            <button
                                onClick={selectAllChapters}
                                className="text-xs text-primary hover:underline"
                            >
                                {selectedChapters.length === chapters.length ? 'Deselect All' : 'Select All'}
                            </button>
                        )}
                    </div>
                    {isLoadingChapters ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing document structure...
                        </div>
                    ) : chapters.length > 0 ? (
                        <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                            {chapters.map((chapter) => {
                                const isSelected = selectedChapters.includes(chapter.index);
                                return (
                                    <button
                                        key={chapter.index}
                                        onClick={() => toggleChapter(chapter.index)}
                                        className={`
                                            w-full flex items-center gap-2 p-2 rounded-md text-left text-sm transition-all
                                            ${isSelected
                                                ? 'bg-primary/10 text-primary'
                                                : 'hover:bg-muted/50'
                                            }
                                        `}
                                    >
                                        <div className={`
                                            h-4 w-4 rounded border-2 flex items-center justify-center shrink-0
                                            ${isSelected
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : 'border-border'
                                            }
                                        `}>
                                            {isSelected && <Check className="h-3 w-3" />}
                                        </div>
                                        <span className="truncate">{chapter.title}</span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground py-2">
                            No chapter structure found in this document
                        </p>
                    )}
                </div>
            )}

            {/* Format Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Format</label>
                <div className="grid grid-cols-3 gap-2">
                    {formatOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = format === option.value;
                        return (
                            <button
                                key={option.value}
                                onClick={() => setFormat(option.value)}
                                className={`
                                    flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border-2 transition-all
                                    ${isSelected
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                                    }
                                `}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs font-medium">{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Generate Button */}
            <Button
                onClick={handleSummarize}
                disabled={isGenerating || (scope === 'chapter' && selectedChapters.length === 0)}
                className="w-full"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating summary...
                    </>
                ) : (
                    '✨ Generate Summary'
                )}
            </Button>
        </div>
    );
}
