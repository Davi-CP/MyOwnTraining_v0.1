import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { marketplaceContainer } from "../marketplace.container";

export function useProHistory() {
  const { data: session } = useAuthSession();
  const userId = session?.user?.id ?? null;

  return useQuery({
    queryKey: ["marketplace", "pro", "history", userId],
    queryFn: () => marketplaceContainer.listProHistory.execute(userId ?? ""),
    enabled: session !== undefined && userId != null,
  });
}