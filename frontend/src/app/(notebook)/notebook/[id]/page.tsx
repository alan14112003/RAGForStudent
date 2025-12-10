'use client';

import { use, useEffect } from 'react';
import NotebookPage from '@/components/features/NotebookPage';
import { useAppDispatch } from '@/store';
import { setSessionId } from '@/store/features/uiSlice';

export default function NotebookRoute({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(setSessionId(id));
    }, [dispatch]);

    return <NotebookPage sessionId={id} />;
}
