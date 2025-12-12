'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook to manage URL query parameters for pagination and filtering.
 * Reads current page from URL and provides methods to update it.
 */
export function useQueryParams() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    /**
     * Get a query parameter value
     */
    const get = useCallback((key: string): string | null => {
        return searchParams.get(key);
    }, [searchParams]);

    /**
     * Get a query parameter as a number with a default value
     */
    const getNumber = useCallback((key: string, defaultValue: number): number => {
        const value = searchParams.get(key);
        if (!value) return defaultValue;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }, [searchParams]);

    /**
     * Set a query parameter and update URL
     */
    const set = useCallback((key: string, value: string | number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, String(value));
        router.push(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname]);

    /**
     * Set multiple query parameters at once
     */
    const setMultiple = useCallback((updates: Record<string, string | number>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            params.set(key, String(value));
        });
        router.push(`${pathname}?${params.toString()}`);
    }, [searchParams, router, pathname]);

    /**
     * Remove a query parameter
     */
    const remove = useCallback((key: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete(key);
        const queryString = params.toString();
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
    }, [searchParams, router, pathname]);

    return {
        get,
        getNumber,
        set,
        setMultiple,
        remove,
        searchParams,
    };
}
