import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authContainer } from "../auth.container";
import { authSessionKey } from "./use-auth-session";

export function useSignIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      authContainer.signIn.execute(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: authSessionKey });
    },
  });
}