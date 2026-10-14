import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import type { CreateBookingInput } from "../domain/marketplace.types";
import { marketplaceContainer } from "../marketplace.container";

export function useCreateBooking() {
  const { data: session } = useAuthSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: (input: CreateBookingInput) => {
      if (!userId) throw new Error("Sessão do cliente não encontrada.");
      return marketplaceContainer.createBooking.execute(userId, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["marketplace", "bookings"] });
    },
  });
}