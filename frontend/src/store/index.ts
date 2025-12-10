import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './features/authSlice';
import notebooksReducer from './features/notebooksSlice';
import notebookSessionReducer from './features/notebookSessionSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        notebooks: notebooksReducer,
        notebookSession: notebookSessionReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
