'use client';

import { useState, useEffect } from 'react';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';
import { Message } from '@/types';
import { toast } from 'react-toastify';
import { chatService } from '@/services/chatService';
import { documentService } from '@/services/documentService';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectSource, setHighlightRange, setMobileTab } from '@/store/features/uiSlice';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { useIsMobile } from '@/hooks';

export default function ChatPanel() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();
    const { sessionId } = useAppSelector((state) => state.ui);
    const user = useAppSelector((state) => state.auth.user);
    const isMobile = useIsMobile();

    // Fetch session data (uses cache)
    const { data: session } = useQuery({
        queryKey: queryKeys.notebooks.detail(sessionId),
        queryFn: () => chatService.getNotebook(sessionId),
        enabled: !!sessionId,
    });

    // Fetch documents for citation lookup (uses cache)
    const { data: documents = [] } = useQuery({
        queryKey: queryKeys.notebooks.documents(sessionId),
        queryFn: () => documentService.getChatDocuments(sessionId),
        enabled: !!sessionId,
    });

    // Initialize messages from session data
    useEffect(() => {
        if (session?.messages) {
            const uiMessages = session.messages.map((m: any) => ({
                id: m.id.toString(),
                role: m.role,
                content: m.content,
                createdAt: new Date(m.created_at || Date.now()),
                citations: m.sources?.map((s: any) => ({
                    id: s.id || Math.random().toString(),
                    sourceName: s.file_name || 'Source',
                    sourceId: s.source_id,
                    documentId: s.document_id,
                    page: s.page_number,
                    highlightRange: (s.start_char !== undefined && s.end_char !== undefined) ? { start: s.start_char, end: s.end_char } : undefined
                }))
            }));
            setMessages(uiMessages);
        }
    }, [session?.messages]);

    const handleCitationClick = (citation: any) => {
        const foundDoc = documents.find((d: any) => d.filename === citation.sourceName || d.name === citation.sourceName);

        if (foundDoc) {
            dispatch(selectSource(foundDoc.id));
            dispatch(setHighlightRange(citation.highlightRange));
            if (isMobile) {
                dispatch(setMobileTab('studio'));
            }
        } else {
            toast.warning(`Could not find source document: ${citation.sourceName}`);
        }
    };

    const handleSend = async (text: string) => {
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, createdAt: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await chatService.sendMessage(sessionId, text);

            const aiMsg: Message = {
                id: response.id.toString(),
                role: 'assistant',
                content: response.content,
                createdAt: new Date(response.created_at),
                citations: response.sources?.map((s: any) => ({
                    id: s.id || Math.random().toString(),
                    sourceName: s.file_name || 'Source',
                    sourceId: s.source_id || 'S?',
                    documentId: s.document_id,
                    page: s.page_number,
                    highlightRange: (s.start_char !== undefined && s.end_char !== undefined) ? { start: s.start_char, end: s.end_char } : undefined
                }))
            };

            setMessages(prev => [...prev, aiMsg]);

            // Invalidate session cache to ensure messages persist when switching tabs
            queryClient.invalidateQueries({ queryKey: queryKeys.notebooks.detail(sessionId) });

            setIsLoading(false);
        } catch (e) {
            console.error(e);
            toast.error("Failed to send message");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900/50 overflow-hidden">
            <MessageList
                messages={messages}
                isLoading={isLoading}
                onCitationClick={handleCitationClick}
                className="flex-1 min-h-0"
                userInfo={user ? { name: user.name, picture: user.picture } : undefined}
            />
            <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
    );
}
