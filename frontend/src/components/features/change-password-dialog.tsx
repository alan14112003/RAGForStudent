'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

// Zod schema for password validation
const passwordSchema = z.object({
    currentPassword: z.string().optional(),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        mode: 'onChange',
    });

    const newPassword = watch('newPassword', '');
    const confirmPassword = watch('confirmPassword', '');

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
        if (passwordStrength <= 2) return 'Weak';
        if (passwordStrength <= 3) return 'Fair';
        if (passwordStrength <= 4) return 'Good';
        return 'Strong';
    };

    const onSubmit = async (data: PasswordFormData) => {
        setIsLoading(true);

        try {
            // TODO: Connect to backend API when available
            // await authService.changePassword(data.currentPassword, data.newPassword);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('Password changed successfully!');
            handleClose();
        } catch (error) {
            toast.error('Unable to change password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        reset();
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
                            <DialogTitle>Change Password</DialogTitle>
                            <DialogDescription>
                                Create a new password for your account
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Current Password <span className="text-muted-foreground">(optional)</span>
                        </label>
                        <div className="relative">
                            <Input
                                type={showCurrentPassword ? 'text' : 'password'}
                                {...register('currentPassword')}
                                placeholder="Enter current password"
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
                            Skip if you haven't set a password yet
                        </p>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                type={showNewPassword ? 'text' : 'password'}
                                {...register('newPassword')}
                                placeholder="Enter new password"
                                className={`pr-10 ${errors.newPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
                                    <span className="text-xs text-muted-foreground">Password strength:</span>
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
                                    <CheckItem passed={passwordChecks.minLength} text="At least 8 characters" />
                                    <CheckItem passed={passwordChecks.hasUppercase} text="Uppercase (A-Z)" />
                                    <CheckItem passed={passwordChecks.hasLowercase} text="Lowercase (a-z)" />
                                    <CheckItem passed={passwordChecks.hasNumber} text="Number (0-9)" />
                                    <CheckItem passed={passwordChecks.hasSpecial} text="Special character" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                {...register('confirmPassword')}
                                placeholder="Re-enter new password"
                                className={`pr-10 ${confirmPassword.length > 0
                                    ? passwordsMatch
                                        ? 'border-green-500 focus-visible:ring-green-500'
                                        : 'border-red-500 focus-visible:ring-red-500'
                                    : ''
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="text-xs text-red-500 flex items-center gap-1">
                                <X size={12} />
                                {errors.confirmPassword.message}
                            </p>
                        )}
                        {passwordsMatch && !errors.confirmPassword && (
                            <p className="text-xs text-green-500 flex items-center gap-1">
                                <Check size={12} />
                                Passwords match
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !passwordsMatch || passwordStrength < 3}
                            className="gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Lock size={16} />
                                    Change Password
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
