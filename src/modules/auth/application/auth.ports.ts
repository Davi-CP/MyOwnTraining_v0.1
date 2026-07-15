import type { AuthSession } from "../domain/auth.types";

export interface AuthRepository {
  getSession(): Promise<AuthSession>;
  signInWithPassword(input: { email: string; password: string }): Promise<void>;
  signOut(): Promise<void>;
}