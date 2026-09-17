import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { marketplaceContainer } from "../marketplace.container";

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { data: session } = useAuthSession();
  const userId = session?.user?.id ?? null;

  return useMutation({
    mutationFn: (trainerId: string) => marketplaceContainer.toggleFavorite.execute(userId ?? "", trainerId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["marketplace", "favorites", userId] });
    },
  });
}