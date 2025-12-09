import api from './api';

export interface Notebook {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Message {
  id: number;
  role: 'user' | 'ai';
  content: string;
  sources?: any[];
  created_at: string;
}

export interface ChatSessionDetail extends Notebook {
  messages: Message[];
  documents?: any[];
}

export const chatService = {
  async getNotebooks(): Promise<Notebook[]> {
    const response = await api.get('/chats/');
    return response.data;
  },

  async createNotebook(title: string): Promise<Notebook> {
    const response = await api.post('/chats/', { title });
    return response.data;
  },

  async getNotebook(id: string): Promise<ChatSessionDetail> {
    const response = await api.get(`/chats/${id}`);
    return response.data;
  },

  async sendMessage(sessionId: string, question: string, useRag: boolean = true) {
    const response = await api.post(`/chats/${sessionId}/messages`, {
      question,
      use_rag: useRag
    });
    return response.data;
  },

  async uploadFile(sessionId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    // The backend expects multipart/form-data
    const response = await api.post(`/chats/${sessionId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  async getChatDocuments(sessionId: string) {
    const response = await api.get(`/chats/${sessionId}/documents`);
    return response.data;
  },
  
  async deleteDocument(sessionId: string, documentId: number) {
    await api.delete(`/chats/${sessionId}/documents/${documentId}`);
  },

  async deleteNotebook(id: number) {
    await api.delete(`/chats/${id}`);
  },

  async renameNotebook(id: number, title: string) {
    const response = await api.put(`/chats/${id}`, { title });
    return response.data;
  }
};



