'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the current screen is mobile (width < 768px)
 */
export function useIsMobile(breakpoint: number = 768): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Check on mount
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Initial check
        checkMobile();

        // Add resize listener
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);

    return isMobile;
}
