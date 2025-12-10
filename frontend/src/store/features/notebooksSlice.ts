import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Notebook, NotebooksState } from '@/types';
import { chatService } from '@/services/chatService';

const initialState: NotebooksState = {
    notebooks: [],
    loading: false,
    error: null,
};

// Async thunks
export const fetchNotebooks = createAsyncThunk(
    'notebooks/fetchNotebooks',
    async (_, { rejectWithValue }) => {
        try {
            const data = await chatService.getNotebooks();
            return data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch notebooks');
        }
    }
);

export const createNotebook = createAsyncThunk(
    'notebooks/createNotebook',
    async (title: string, { rejectWithValue }) => {
        try {
            const newNotebook = await chatService.createNotebook(title);
            return newNotebook;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to create notebook');
        }
    }
);

export const renameNotebook = createAsyncThunk(
    'notebooks/renameNotebook',
    async ({ id, title }: { id: number; title: string }, { rejectWithValue }) => {
        try {
            await chatService.renameNotebook(id, title);
            return { id, title };
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to rename notebook');
        }
    }
);

export const deleteNotebook = createAsyncThunk(
    'notebooks/deleteNotebook',
    async (id: number, { rejectWithValue }) => {
        try {
            await chatService.deleteNotebook(id);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to delete notebook');
        }
    }
);

const notebooksSlice = createSlice({
    name: 'notebooks',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch notebooks
            .addCase(fetchNotebooks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNotebooks.fulfilled, (state, action: PayloadAction<Notebook[]>) => {
                state.loading = false;
                state.notebooks = action.payload;
            })
            .addCase(fetchNotebooks.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create notebook
            .addCase(createNotebook.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNotebook.fulfilled, (state, action: PayloadAction<Notebook>) => {
                state.loading = false;
                state.notebooks.unshift(action.payload);
            })
            .addCase(createNotebook.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Rename notebook
            .addCase(renameNotebook.fulfilled, (state, action) => {
                const { id, title } = action.payload;
                const notebook = state.notebooks.find(nb => nb.id === id);
                if (notebook) {
                    notebook.title = title;
                }
            })
            .addCase(renameNotebook.rejected, (state, action) => {
                state.error = action.payload as string;
            })
            // Delete notebook
            .addCase(deleteNotebook.fulfilled, (state, action: PayloadAction<number>) => {
                state.notebooks = state.notebooks.filter(nb => nb.id !== action.payload);
            })
            .addCase(deleteNotebook.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = notebooksSlice.actions;
export default notebooksSlice.reducer;
