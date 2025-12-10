'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Calendar } from 'lucide-react';
import { getInitials } from '@/lib/helpers';

interface HeroSectionProps {
    user: {
        name?: string;
        email?: string;
        picture?: string;
        createdAt?: string;
    } | null;
}

export default function HeroSection({ user }: HeroSectionProps) {
    const joinDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Unknown';

    return (
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
                        {user?.name || 'User'}
                    </h1>
                    <p className="text-white/80 flex items-center justify-center sm:justify-start gap-2">
                        <Mail size={16} />
                        {user?.email || 'email@example.com'}
                    </p>
                    <p className="text-white/60 text-sm mt-2 flex items-center justify-center sm:justify-start gap-2">
                        <Calendar size={14} />
                        Member since {joinDate}
                    </p>
                </div>
            </div>
        </div>
    );
}
