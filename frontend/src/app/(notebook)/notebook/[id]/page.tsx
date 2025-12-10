'use client';

import { use } from 'react';
import NotebookPage from '@/components/features/NotebookPage';

export default function NotebookRoute({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <NotebookPage sessionId={id} />;
}
