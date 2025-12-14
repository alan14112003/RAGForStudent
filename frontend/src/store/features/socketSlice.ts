import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SocketConnectionStatus } from '@/types/socket.types';

interface SocketState {
  status: SocketConnectionStatus;
  error: string | null;
}

const initialState: SocketState = {
  status: 'disconnected',
  error: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<SocketConnectionStatus>) => {
      state.status = action.payload;
      if (action.payload === 'connected') {
        state.error = null;
      }
    },
    setConnectionError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.status = 'disconnected';
    },
    resetSocket: (state) => {
      state.status = 'disconnected';
      state.error = null;
    },
  },
});

export const { setConnectionStatus, setConnectionError, resetSocket } = socketSlice.actions;

export default socketSlice.reducer;
