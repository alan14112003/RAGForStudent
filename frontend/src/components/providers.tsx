'use client';

import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import { store } from '@/store';
import { queryClient } from '@/lib/react-query';
import { ThemeProvider } from 'next-themes';
import 'react-toastify/dist/ReactToastify.css';

import { GoogleOAuthProvider } from '@react-oauth/google';

import { useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { hydrateAuth } from '@/store/features/authSlice';
import { useSocketConnection } from '@/hooks/useSocket';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthHydrator>
              <SocketProvider>{children}</SocketProvider>
            </AuthHydrator>
            <ToastContainer position="top-right" autoClose={3000} />
          </ThemeProvider>
        </GoogleOAuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);
  return <>{children}</>;
}

function SocketProvider({ children }: { children: React.ReactNode }) {
  useSocketConnection();
  return <>{children}</>;
}


