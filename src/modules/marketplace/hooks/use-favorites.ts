import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { marketplaceContainer } from "../marketplace.container";

export function useFavorites() {
  const { data: session } = useAuthSession();
  const userId = session?.user?.id ?? null;

  return useQuery({
    queryKey: ["marketplace", "favorites", userId],
    queryFn: () => marketplaceContainer.listFavorites.execute(userId ?? ""),
    enabled: session !== undefined && userId != null,
  });
}