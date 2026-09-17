export type AuthUser = {
  id: string;
  email: string | null;
  roles: string[];
  primaryRole: string | null;
};

export type AuthSession = {
  user: AuthUser | null;
  accessToken: string | null;
  roles: string[];
  primaryRole: string | null;
};