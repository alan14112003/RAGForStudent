// Chat/Notebook related types
import { Message } from './message.types';

export interface Notebook {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  source_count: number;
}

export interface ChatSessionDetail extends Notebook {
  messages: Message[];
  documents?: DocumentSource[];
}

// Document source type for notebook documents
export interface DocumentSource {
  id: number;
  filename?: string;
  name?: string;
  created_at?: string;
  content?: string;
  type?: string;
}
