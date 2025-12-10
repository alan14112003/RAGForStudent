// Auth related types matching backend responses

export interface BackendUser {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: BackendUser;
}
