import {supabase} from "../../../integrations/supabase/client";
import { AppError } from "../../../shared/lib/app-error";
import type { AuthRepository } from "../application/auth.ports";
import type { AuthSession } from "../domain/auth.types";

export class SupabaseAuthRepository implements AuthRepository {
  async getSession(): Promise<AuthSession> {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new AppError("AUTH_SESSION_ERROR", error.message);

    const session = data.session;
    let roles: string[] = [];

    if (session?.user) {
      const { data: roleRows, error: roleError } = await supabase
        .from("papeis_usuario")
        .select("papel")
        .eq("usuario_id", session.user.id);

      if (roleError) throw new AppError("AUTH_ROLE_ERROR", roleError.message);
      roles = roleRows.map((row) => row.papel as string);
    }

    return {
      user: session?.user
        ? {
            id: session.user.id,
            email: session.user.email ?? null,
            roles,
            primaryRole: roles[0] ?? null,
          }
        : null,
      accessToken: session?.access_token ?? null,
      roles,
      primaryRole: roles[0] ?? null,
    };
  }

  async signInWithPassword(input: { email: string; password: string }): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword(input);
    if (error) throw new AppError("AUTH_SIGNIN_ERROR", error.message);
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new AppError("AUTH_SIGNOUT_ERROR", error.message);
  }
}