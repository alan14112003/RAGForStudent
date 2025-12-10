'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, User, Lock, Edit2, Save, X } from 'lucide-react';
import { toast } from 'react-toastify';

interface AccountSettingsProps {
    user: {
        name?: string;
        email?: string;
    } | null;
    onOpenPasswordDialog: () => void;
}

export default function AccountSettings({ user, onOpenPasswordDialog }: AccountSettingsProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(user?.name || '');

    const handleSaveProfile = async () => {
        try {
            // TODO: Connect to backend API
            toast.success('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Unable to update profile. Please try again.');
        }
    };

    const handleCancelEdit = () => {
        setEditedName(user?.name || '');
        setIsEditing(false);
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Account Information</CardTitle>
                        <CardDescription>Manage your personal information</CardDescription>
                    </div>
                    {!isEditing ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                            className="gap-2"
                        >
                            <Edit2 size={14} />
                            Edit
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                            >
                                <X size={14} />
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSaveProfile}
                                className="gap-2"
                            >
                                <Save size={14} />
                                Save
                            </Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Email Field */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3 min-w-[140px]">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Email</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-foreground font-medium">{user?.email || 'Not updated'}</p>
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                </div>

                {/* Name Field */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3 min-w-[140px]">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Full Name</span>
                    </div>
                    <div className="flex-1">
                        {isEditing ? (
                            <Input
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                placeholder="Enter full name"
                                className="max-w-md"
                            />
                        ) : (
                            <p className="text-foreground font-medium">{user?.name || 'Not updated'}</p>
                        )}
                    </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3 min-w-[140px]">
                        <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">Password</span>
                    </div>
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="text-foreground font-medium">••••••••••</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpenPasswordDialog}
                            className="w-fit gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-900/20"
                        >
                            <Lock size={14} />
                            Change Password
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
