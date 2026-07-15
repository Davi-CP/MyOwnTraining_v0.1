import { GetSessionUseCase } from "./application/get-session.usecase";
import { SignInUseCase } from "./application/sign-in.usecase";
import { SignOutUseCase } from "./application/sign-out.usecase";
import { SupabaseAuthRepository } from "./infrastructure/supabase-auth.repository";

const repo = new SupabaseAuthRepository();

export const authContainer = {
  getSession: new GetSessionUseCase(repo),
  signIn: new SignInUseCase(repo),
  signOut: new SignOutUseCase(repo),
};