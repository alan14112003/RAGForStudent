'use client';

import { useParams } from 'next/navigation';
import FlashcardPage from '@/components/features/FlashcardPage';

export default function FlashcardPageRoute() {
    const params = useParams();
    const sessionId = params.id as string;
    const flashcardId = parseInt(params.flashcardId as string);

    return <FlashcardPage sessionId={sessionId} flashcardId={flashcardId} />;
}
