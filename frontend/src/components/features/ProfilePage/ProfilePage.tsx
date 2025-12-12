'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { chatService } from '@/services/chatService';
import Header from '@/components/features/Header/Header';
import HeroSection from './components/HeroSection';
import StatsCards from './components/StatsCards';
import AccountSettings from './components/AccountSettings';
import DangerZone from './components/DangerZone';
import ChangePasswordDialog from './components/ChangePasswordDialog';

export default function ProfilePage() {
    const router = useRouter();
    const user = useAppSelector((state) => state.auth.user);

    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [notebookCount, setNotebookCount] = useState<number>(0);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    const daysSinceRegistration = user?.createdAt
        ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    useEffect(() => {
        const loadStats = async () => {
            try {
                setIsLoadingStats(true);
                const stats = await chatService.getNotebookStats();
                setNotebookCount(stats.total);
            } catch (error) {
                console.error('Failed to load notebook count:', error);
            } finally {
                setIsLoadingStats(false);
            }
        };
        loadStats();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/')}
                    className="gap-2"
                >
                    <ArrowLeft size={16} />
                    <span className="hidden sm:inline">Back</span>
                </Button>
            </Header>

            <main className="flex-1 p-4 sm:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <HeroSection user={user} />

                    <StatsCards
                        notebookCount={notebookCount}
                        daysSinceRegistration={daysSinceRegistration}
                        isLoading={isLoadingStats}
                    />

                    <AccountSettings
                        user={user}
                        onOpenPasswordDialog={() => setIsPasswordDialogOpen(true)}
                    />

                    <DangerZone />
                </div>
            </main>

            <ChangePasswordDialog
                open={isPasswordDialogOpen}
                onOpenChange={setIsPasswordDialogOpen}
            />
        </div>
    );
}
