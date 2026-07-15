export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthSession = {
  user: AuthUser | null;
  accessToken: string | null;
};