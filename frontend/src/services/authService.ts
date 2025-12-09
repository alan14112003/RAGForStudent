import api from './api';

export const authService = {
  loginWithGoogle: async (token: string) => {
    // Post to /auth/login/google with { token: "..." }
    const response = await api.post('/auth/login/google', { token });
    
    // Check what the backend returns. 
    // Based on auth.py: return { "access_token": ..., "token_type": "bearer" }
    // The frontend expects { user: ..., token: ... } to dispatch to store.
    
    return {
      // API doesn't return user info yet, so we mock it or we need another call.
      // For now, let's use a placeholder or decode if possible. 
      // Ideally we should call /users/me here if we had it. 
      // Let's assume for now we just return the token and some dummy user info 
      // or we can extract info from the Google credential on the frontend before calling this, 
      // but `loginWithGoogle` signature here only takes token.
      
      user: {
        id: 'user_id', 
        name: 'User', 
        email: 'user@example.com',
        avatar: '' 
      },
      token: response.data.access_token,
    };
  },

  loginDev: async (email: string) => {
    const response = await api.post('/auth/login/dev', { email, full_name: "Dev Student" });
    return {
      user: {
        id: 'dev_user_id',
        name: 'Dev Student',
        email: email,
        avatar: 'https://ui-avatars.com/api/?name=Dev+Student'
      },
      token: response.data.access_token,
    };
  },
};
