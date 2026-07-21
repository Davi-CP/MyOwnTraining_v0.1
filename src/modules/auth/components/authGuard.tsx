import { Navigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useAuthSession } from "../hooks/use-auth-session";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { data, isLoading } = useAuthSession();

  if (isLoading) return <div>Carregando...</div>;
  if (!data?.user) return <Navigate to="/" />;

  return <>{children}</>;
}