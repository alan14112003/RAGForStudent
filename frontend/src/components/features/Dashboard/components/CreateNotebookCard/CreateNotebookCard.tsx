'use client';

import { Plus } from 'lucide-react';

interface CreateNotebookCardProps {
    onClick: () => void;
}

export default function CreateNotebookCard({ onClick }: CreateNotebookCardProps) {
    return (
        <div
            onClick={onClick}
            className="group cursor-pointer border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 rounded-2xl flex flex-col items-center justify-center aspect-square hover:bg-primary/5 transition-all duration-300"
        >
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform mb-4">
                <Plus size={28} />
            </div>
            <span className="font-medium text-lg text-foreground/80 group-hover:text-primary transition-colors">New Notebook</span>
        </div>
    );
}
