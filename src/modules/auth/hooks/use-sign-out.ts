import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authContainer } from "../auth.container";
import { authSessionKey } from "./use-auth-session";

export function useSignOut() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authContainer.signOut.execute(),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: authSessionKey });
    },
  });
}