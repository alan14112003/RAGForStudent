'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

export default function DangerZone() {
    return (
        <Card className="border-red-200 dark:border-red-900/50 shadow-lg">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                <CardDescription>Actions that cannot be undone</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-red-50/50 dark:bg-red-900/10">
                    <div>
                        <p className="font-medium text-foreground">Delete Account</p>
                        <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all your data
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="w-fit"
                        onClick={() => toast.info('This feature is under development')}
                    >
                        Delete Account
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
