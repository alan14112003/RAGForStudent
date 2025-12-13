'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Calendar } from 'lucide-react';

interface StatsCardsProps {
    notebookCount: number;
    daysSinceRegistration: number;
    isLoading?: boolean;
}

export default function StatsCards({ notebookCount, daysSinceRegistration, isLoading }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 shadow-lg bg-linear-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">
                            {isLoading ? '...' : notebookCount}
                        </p>
                        <p className="text-sm text-muted-foreground">Notebook</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-linear-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10">
                <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-foreground">
                            {daysSinceRegistration}
                        </p>
                        <p className="text-sm text-muted-foreground">Days Active</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
