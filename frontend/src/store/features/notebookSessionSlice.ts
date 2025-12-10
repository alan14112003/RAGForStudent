import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatSessionDetail, DocumentSource, NotebookSessionState } from '@/types';
import { chatService } from '@/services/chatService';

const initialState: NotebookSessionState = {
    session: null,
    documents: [],
    selectedSourceId: null,
    highlightRange: undefined,
    loading: false,
    uploading: false,
    error: null,
};

// Async thunks
export const fetchSession = createAsyncThunk(
    'notebookSession/fetchSession',
    async (sessionId: string, { rejectWithValue }) => {
        try {
            const data = await chatService.getNotebook(sessionId);
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to load notebook');
        }
    }
);

export const fetchDocuments = createAsyncThunk(
    'notebookSession/fetchDocuments',
    async (sessionId: string, { rejectWithValue }) => {
        try {
            const docs = await chatService.getChatDocuments(sessionId);
            return docs;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to load documents');
        }
    }
);

export const uploadDocument = createAsyncThunk(
    'notebookSession/uploadDocument',
    async ({ sessionId, file }: { sessionId: string; file: File }, { dispatch, rejectWithValue }) => {
        try {
            await chatService.uploadFile(sessionId, file);
            // Reload documents after upload
            dispatch(fetchDocuments(sessionId));
            return true;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Upload failed');
        }
    }
);

export const deleteDocument = createAsyncThunk(
    'notebookSession/deleteDocument',
    async ({ sessionId, documentId }: { sessionId: string; documentId: number }, { rejectWithValue }) => {
        try {
            await chatService.deleteDocument(sessionId, documentId);
            return documentId;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete document');
        }
    }
);

export const renameSession = createAsyncThunk(
    'notebookSession/renameSession',
    async ({ sessionId, title }: { sessionId: string; title: string }, { rejectWithValue }) => {
        try {
            await chatService.renameNotebook(parseInt(sessionId), title);
            return title;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to rename notebook');
        }
    }
);

const notebookSessionSlice = createSlice({
    name: 'notebookSession',
    initialState,
    reducers: {
        selectSource: (state, action: PayloadAction<number | string | null>) => {
            state.selectedSourceId = action.payload;
        },
        setHighlightRange: (state, action: PayloadAction<{ start: number; end: number } | undefined>) => {
            state.highlightRange = action.payload;
        },
        clearSession: (state) => {
            state.session = null;
            state.documents = [];
            state.selectedSourceId = null;
            state.highlightRange = undefined;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch session
            .addCase(fetchSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSession.fulfilled, (state, action: PayloadAction<ChatSessionDetail>) => {
                state.loading = false;
                state.session = action.payload;
            })
            .addCase(fetchSession.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch documents
            .addCase(fetchDocuments.fulfilled, (state, action) => {
                state.documents = action.payload;
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Upload document
            .addCase(uploadDocument.pending, (state) => {
                state.uploading = true;
            })
            .addCase(uploadDocument.fulfilled, (state) => {
                state.uploading = false;
            })
            .addCase(uploadDocument.rejected, (state, action) => {
                state.uploading = false;
                state.error = action.payload as string;
            })
            // Delete document
            .addCase(deleteDocument.fulfilled, (state, action: PayloadAction<number>) => {
                state.documents = state.documents.filter(d => d.id !== action.payload);
                if (state.selectedSourceId === action.payload) {
                    state.selectedSourceId = null;
                }
            })
            .addCase(deleteDocument.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Rename session
            .addCase(renameSession.fulfilled, (state, action: PayloadAction<string>) => {
                if (state.session) {
                    state.session.title = action.payload;
                }
            })
            .addCase(renameSession.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { selectSource, setHighlightRange, clearSession, clearError } = notebookSessionSlice.actions;
export default notebookSessionSlice.reducer;
