'use client';

import { FolderOpen, MessageSquare, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MobileTab } from '@/types';

interface MobileTabNavProps {
    activeTab: MobileTab;
    onTabChange: (tab: MobileTab) => void;
}

export default function MobileTabNav({ activeTab, onTabChange }: MobileTabNavProps) {
    const tabs = [
        { id: 'sources' as MobileTab, label: 'Sources', icon: FolderOpen },
        { id: 'chat' as MobileTab, label: 'Chat', icon: MessageSquare },
        { id: 'studio' as MobileTab, label: 'Studio', icon: Sparkles },
    ];

    return (
        <div className="flex border-b bg-background shrink-0">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                        activeTab === tab.id
                            ? "text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <tab.icon size={18} />
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    );
}
