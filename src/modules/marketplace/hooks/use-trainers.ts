import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { marketplaceContainer } from "../marketplace.container";

export function useTrainers() {
  const { data: session } = useAuthSession();
  const userId = session?.user?.id ?? null;

  return useQuery({
    queryKey: ["marketplace", "trainers", userId],
    queryFn: () => marketplaceContainer.listTrainers.execute(userId),
    enabled: session !== undefined,
  });
}