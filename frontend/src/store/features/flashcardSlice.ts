import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FlashcardState {
    currentIndex: number;
    isFlipped: boolean;
}

const initialState: FlashcardState = {
    currentIndex: 0,
    isFlipped: false,
};

const flashcardSlice = createSlice({
    name: 'flashcard',
    initialState,
    reducers: {
        setIndex: (state, action: PayloadAction<number>) => {
            state.currentIndex = action.payload;
            state.isFlipped = false;
        },
        nextCard: (state, action: PayloadAction<number>) => {
            if (state.currentIndex < action.payload - 1) {
                state.currentIndex += 1;
                state.isFlipped = false;
            }
        },
        prevCard: (state) => {
            if (state.currentIndex > 0) {
                state.currentIndex -= 1;
                state.isFlipped = false;
            }
        },
        flipCard: (state) => {
            state.isFlipped = !state.isFlipped;
        },
        resetFlashcardState: (state) => {
            state.currentIndex = 0;
            state.isFlipped = false;
        },
    },
});

export const { setIndex, nextCard, prevCard, flipCard, resetFlashcardState } = flashcardSlice.actions;
export default flashcardSlice.reducer;
