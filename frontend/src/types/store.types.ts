// Redux store state types
import { User } from './user.types';
import { Notebook, ChatSessionDetail, DocumentSource } from './chat.types';

export interface AuthState {
  user: User | null;
  token: string | null;
  isInitialized: boolean;
}

export interface NotebooksState {
  notebooks: Notebook[];
  loading: boolean;
  error: string | null;
}

export interface NotebookSessionState {
  session: ChatSessionDetail | null;
  documents: DocumentSource[];
  selectedSourceId: number | string | null;
  highlightRange: { start: number; end: number } | undefined;
  loading: boolean;
  uploading: boolean;
  error: string | null;
}
