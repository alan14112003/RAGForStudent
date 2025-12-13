// Studio item status configuration
// Extensible config for different status states

import { ReactNode } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { StudioItemStatus } from '@/types';

export interface StudioStatusConfig {
    icon: ReactNode;
    label: string;
    className: string;
}

// Registry pattern: add new statuses here when scaling
export const studioStatusRegistry: Record<StudioItemStatus, StudioStatusConfig> = {
    pending: {
        icon: <Loader2 size={12} className="animate-spin" />,
        label: 'Pending',
        className: 'text-yellow-500 border-yellow-200',
    },
    generating: {
        icon: <Loader2 size={12} className="animate-spin" />,
        label: 'Generating',
        className: 'text-blue-500 border-blue-200',
    },
    completed: {
        icon: <CheckCircle2 size={12} />,
        label: 'Completed',
        className: 'text-green-500 border-green-200',
    },
    failed: {
        icon: <XCircle size={12} />,
        label: 'Error',
        className: 'text-red-500 border-red-200',
    },
};

/**
 * Get config for a studio item status
 * Normalizes status to lowercase for consistency with backend
 */
export function getStudioStatusConfig(status: string): StudioStatusConfig | undefined {
    const normalizedStatus = status.toLowerCase() as StudioItemStatus;
    return studioStatusRegistry[normalizedStatus];
}

/**
 * Check if status indicates the item is ready to view
 */
export function isStatusCompleted(status: string): boolean {
    return status.toLowerCase() === 'completed';
}

/**
 * Check if status indicates the item is in progress
 */
export function isStatusInProgress(status: string): boolean {
    const normalized = status.toLowerCase();
    return normalized === 'pending' || normalized === 'generating';
}
