'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store';
import Header from '@/components/features/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getInitials } from '@/lib/helpers';
import {
    ArrowLeft,
    Mail,
    User,
    Lock,
    Calendar,
    BookOpen,
    Edit2,
    Save,
    X
} from 'lucide-react';
import ChangePasswordDialog from '@/components/features/change-password-dialog';
import { toast } from 'react-toastify';
import { chatService } from '@/services/chatService';

export default function ProfilePage() {
    const router = useRouter();
    const user = useAppSelector((state) => state.auth.user);

    const [isEditing, setIsEditing] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [editedName, setEditedName] = useState(user?.name || '');
    const [notebookCount, setNotebookCount] = useState<number>(0);
    const [isLoadingStats, setIsLoadingStats] = useState(true);

    // Format join date from user.createdAt
    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Chưa xác định';

    // Calculate days since registration
    const daysSinceRegistration = user?.createdAt
        ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    // Load notebook count on mount
    useEffect(() => {
        const loadStats = async () => {
            try {
                setIsLoadingStats(true);
                const notebooks = await chatService.getNotebooks();
                setNotebookCount(notebooks.length);
            } catch (error) {
                console.error('Failed to load notebook count:', error);
            } finally {
                setIsLoadingStats(false);
            }
        };
        loadStats();
    }, []);

    const handleSaveProfile = async () => {
        try {
            // TODO: Connect to backend API when available
            toast.success('Cập nhật hồ sơ thành công!');
            setIsEditing(false);
        } catch (error) {
            toast.error('Không thể cập nhật hồ sơ. Vui lòng thử lại.');
        }
    };

    const handleCancelEdit = () => {
        setEditedName(user?.name || '');
        setIsEditing(false);
    };

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
                    <span className="hidden sm:inline">Quay lại</span>
                </Button>
            </Header>

            <main className="flex-1 p-4 sm:p-8">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Hero Section with Gradient Background */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 p-8 sm:p-12">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

                        <div className="relative flex flex-col sm:flex-row items-center gap-6">
                            {/* Large Avatar */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-white/20 rounded-full blur-sm group-hover:blur-md transition-all duration-300" />
                                <Avatar className="relative h-24 w-24 sm:h-32 sm:w-32 ring-4 ring-white/30 shadow-2xl">
                                    <AvatarImage src={user?.picture} alt={user?.name || 'User'} />
                                    <AvatarFallback className="bg-white/20 text-white text-2xl sm:text-4xl font-bold backdrop-blur-sm">
                                        {getInitials(user?.name)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            {/* User Info */}
                            <div className="text-center sm:text-left text-white">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
                                    {user?.name || 'Người dùng'}
                                </h1>
                                <p className="text-white/80 flex items-center justify-center sm:justify-start gap-2">
                                    <Mail size={16} />
                                    {user?.email || 'email@example.com'}
                                </p>
                                <p className="text-white/60 text-sm mt-2 flex items-center justify-center sm:justify-start gap-2">
                                    <Calendar size={14} />
                                    Thành viên từ {joinDate}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">
                                        {isLoadingStats ? '...' : notebookCount}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Notebook</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">
                                        {daysSinceRegistration}
                                    </p>
                                    <p className="text-sm text-muted-foreground">Ngày hoạt động</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Account Settings Card */}
                    <Card className="border-0 shadow-lg">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl">Thông tin tài khoản</CardTitle>
                                    <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
                                </div>
                                {!isEditing ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="gap-2"
                                    >
                                        <Edit2 size={14} />
                                        Chỉnh sửa
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
                                            Lưu
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
                                    <p className="text-foreground font-medium">{user?.email || 'Chưa cập nhật'}</p>
                                    <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
                                </div>
                            </div>

                            {/* Name Field */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-xl bg-muted/30">
                                <div className="flex items-center gap-3 min-w-[140px]">
                                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                        <User className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">Họ và tên</span>
                                </div>
                                <div className="flex-1">
                                    {isEditing ? (
                                        <Input
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            placeholder="Nhập họ và tên"
                                            className="max-w-md"
                                        />
                                    ) : (
                                        <p className="text-foreground font-medium">{user?.name || 'Chưa cập nhật'}</p>
                                    )}
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 rounded-xl bg-muted/30">
                                <div className="flex items-center gap-3 min-w-[140px]">
                                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                                        <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground">Mật khẩu</span>
                                </div>
                                <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <p className="text-foreground font-medium">••••••••••</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsPasswordDialogOpen(true)}
                                        className="w-fit gap-2 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 dark:hover:bg-orange-900/20"
                                    >
                                        <Lock size={14} />
                                        Đổi mật khẩu
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-900/50 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl text-red-600 dark:text-red-400">Vùng nguy hiểm</CardTitle>
                            <CardDescription>Các hành động không thể hoàn tác</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl bg-red-50/50 dark:bg-red-900/10">
                                <div>
                                    <p className="font-medium text-foreground">Xóa tài khoản</p>
                                    <p className="text-sm text-muted-foreground">
                                        Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="w-fit"
                                    onClick={() => toast.info('Tính năng này đang được phát triển')}
                                >
                                    Xóa tài khoản
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* Change Password Dialog */}
            <ChangePasswordDialog
                open={isPasswordDialogOpen}
                onOpenChange={setIsPasswordDialogOpen}
            />
        </div>
    );
}
