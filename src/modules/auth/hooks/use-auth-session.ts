import { useQuery } from "@tanstack/react-query";
import { authContainer } from "../auth.container";

export const authSessionKey = ["auth", "session"] as const;

export function useAuthSession() {
  return useQuery({
    queryKey: authSessionKey,
    queryFn: () => authContainer.getSession.execute(),
  });
}