'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Password strength validation
    const passwordChecks = {
        minLength: newPassword.length >= 8,
        hasUppercase: /[A-Z]/.test(newPassword),
        hasLowercase: /[a-z]/.test(newPassword),
        hasNumber: /[0-9]/.test(newPassword),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    };

    const passwordStrength = Object.values(passwordChecks).filter(Boolean).length;
    const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

    const getStrengthColor = () => {
        if (passwordStrength <= 2) return 'bg-red-500';
        if (passwordStrength <= 3) return 'bg-orange-500';
        if (passwordStrength <= 4) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStrengthText = () => {
        if (passwordStrength <= 2) return 'Yếu';
        if (passwordStrength <= 3) return 'Trung bình';
        if (passwordStrength <= 4) return 'Khá';
        return 'Mạnh';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu mới không khớp');
            return;
        }

        if (passwordStrength < 3) {
            toast.error('Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.');
            return;
        }

        setIsLoading(true);

        try {
            // TODO: Connect to backend API when available
            // await authService.changePassword(currentPassword, newPassword);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Đổi mật khẩu thành công!');
            handleClose();
        } catch (error) {
            toast.error('Không thể đổi mật khẩu. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        onOpenChange(false);
    };

    const CheckItem = ({ passed, text }: { passed: boolean; text: string }) => (
        <div className={`flex items-center gap-2 text-xs transition-colors ${passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
            {passed ? <Check size={12} /> : <X size={12} />}
            {text}
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle>Đổi mật khẩu</DialogTitle>
                            <DialogDescription>
                                Tạo mật khẩu mới cho tài khoản của bạn
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Mật khẩu hiện tại <span className="text-muted-foreground">(tùy chọn)</span>
                        </label>
                        <div className="relative">
                            <Input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Nhập mật khẩu hiện tại"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Bỏ qua nếu bạn chưa thiết lập mật khẩu
                        </p>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nhập mật khẩu mới"
                                className="pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {newPassword.length > 0 && (
                            <div className="space-y-2 p-3 rounded-lg bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Độ mạnh mật khẩu:</span>
                                    <span className={`text-xs font-medium ${passwordStrength <= 2 ? 'text-red-500' :
                                            passwordStrength <= 3 ? 'text-orange-500' :
                                                passwordStrength <= 4 ? 'text-yellow-600' : 'text-green-500'
                                        }`}>
                                        {getStrengthText()}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-1 mt-2">
                                    <CheckItem passed={passwordChecks.minLength} text="Ít nhất 8 ký tự" />
                                    <CheckItem passed={passwordChecks.hasUppercase} text="Chữ hoa (A-Z)" />
                                    <CheckItem passed={passwordChecks.hasLowercase} text="Chữ thường (a-z)" />
                                    <CheckItem passed={passwordChecks.hasNumber} text="Số (0-9)" />
                                    <CheckItem passed={passwordChecks.hasSpecial} text="Ký tự đặc biệt" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Nhập lại mật khẩu mới"
                                className={`pr-10 ${confirmPassword.length > 0
                                        ? passwordsMatch
                                            ? 'border-green-500 focus-visible:ring-green-500'
                                            : 'border-red-500 focus-visible:ring-red-500'
                                        : ''
                                    }`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {confirmPassword.length > 0 && !passwordsMatch && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <X size={12} />
                                Mật khẩu không khớp
                            </p>
                        )}
                        {passwordsMatch && (
                            <p className="text-xs text-green-500 flex items-center gap-1">
                                <Check size={12} />
                                Mật khẩu khớp
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !passwordsMatch || passwordStrength < 3}
                            className="gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Lock size={16} />
                                    Đổi mật khẩu
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
