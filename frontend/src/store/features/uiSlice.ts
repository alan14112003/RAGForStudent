import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    sessionId: string;
    selectedSourceId: number | string | null;
    highlightRange?: { start: number; end: number };
}

const initialState: UIState = {
    sessionId: "",
    selectedSourceId: null,
    highlightRange: undefined,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setSessionId: (state, action: PayloadAction<string>) => {
            state.sessionId = action.payload;
        },
        selectSource: (state, action: PayloadAction<number | string | null>) => {
            state.selectedSourceId = action.payload;
        },
        setHighlightRange: (state, action: PayloadAction<{ start: number; end: number } | undefined>) => {
            state.highlightRange = action.payload;
        },
        clearUI: (state) => {
            state.selectedSourceId = null;
            state.highlightRange = undefined;
        },
    },
});

export const { setSessionId, selectSource, setHighlightRange, clearUI } = uiSlice.actions;
export default uiSlice.reducer;
