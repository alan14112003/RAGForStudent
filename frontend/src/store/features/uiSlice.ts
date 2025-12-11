import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MobileTab } from '@/types';

interface UIState {
    sessionId: string;
    selectedSourceId: number | string | null;
    highlightRange?: { start: number; end: number };
    mobileTab: MobileTab;
}

const initialState: UIState = {
    sessionId: "",
    selectedSourceId: null,
    highlightRange: undefined,
    mobileTab: 'chat',
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
        setMobileTab: (state, action: PayloadAction<MobileTab>) => {
            state.mobileTab = action.payload;
        },
        clearUI: (state) => {
            state.selectedSourceId = null;
            state.highlightRange = undefined;
            state.mobileTab = 'chat';
        },
    },
});

export const { setSessionId, selectSource, setHighlightRange, setMobileTab, clearUI } = uiSlice.actions;
export default uiSlice.reducer;

