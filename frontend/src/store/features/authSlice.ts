import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  // If we have a token in storage, we are technically not fully "checked" until we hydrate,
  // but for simple sync storage access, we can start as true IF we trust initialState logic.
  // HOWEVER, hydration logic might be more complex later.
  // Let's set it to false and let hydrateAuth set it to true.
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isInitialized = true;
      localStorage.setItem('token', token);
      if (user) {
          localStorage.setItem('user', JSON.stringify(user));
      } else {
          localStorage.removeItem('user');
      }
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.isInitialized = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    hydrateAuth: (state) => {
       const token = localStorage.getItem('token');
       const userStr = localStorage.getItem('user');
       if (token && userStr && userStr !== "undefined") {
           try {
               state.token = token;
               state.user = JSON.parse(userStr);
           } catch (e) {
               console.error("Failed to parse user from local storage", e);
               localStorage.removeItem('user');
               state.user = null;
           }
       }
       state.isInitialized = true;
    }
  },
});

export const { setCredentials, logOut, hydrateAuth } = authSlice.actions;

export default authSlice.reducer;
