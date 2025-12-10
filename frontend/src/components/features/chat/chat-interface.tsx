'use client';

import { useState, useEffect } from 'react';
import ChatInput from './chat-input';
import MessageList, { Message } from './message-list';
import FileUpload from '@/components/common/file-upload';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Paperclip, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import { chatService } from '@/services/chatService';
import { useAppSelector } from '@/store';

interface ChatInterfaceProps {
    sessionId: string;
    initialMessages: any[];
    onCitationClick?: (citation: any) => void;
}

export default function ChatInterface({ sessionId, initialMessages, onCitationClick }: ChatInterfaceProps) {
    // Convert backend messages to UI messages
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const user = useAppSelector((state) => state.auth.user);

    useEffect(() => {
        if (initialMessages) {
            const uiMessages = initialMessages.map(m => ({
                id: m.id.toString(),
                role: m.role,
                content: m.content,
                createdAt: new Date(m.created_at || Date.now()),
                citations: m.sources?.map((s: any) => ({
                    id: s.id || Math.random().toString(),
                    sourceName: s.file_name || 'Source',
                    sourceId: s.source_id, // backend provides source_id like "S1"
                    documentId: s.document_id,
                    page: s.page_number,
                    highlightRange: (s.start_char !== undefined && s.end_char !== undefined) ? { start: s.start_char, end: s.end_char } : undefined
                }))
            }));
            setMessages(uiMessages);
        }
    }, [initialMessages]);

    const handleSend = async (text: string) => {
        // Optimistic UI Update
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, createdAt: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const response = await chatService.sendMessage(sessionId, text);

            // Response is the AI message from backend
            // Assume backend sends source_id (S1) and start_char/end_char now
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
                onCitationClick={onCitationClick}
                className="flex-1 min-h-0"
                userInfo={user ? { name: user.name, picture: user.picture } : undefined}
            />
            <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
    );
}


