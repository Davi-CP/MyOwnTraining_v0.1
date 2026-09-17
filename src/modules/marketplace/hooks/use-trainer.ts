import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { marketplaceContainer } from "../marketplace.container";

export function useTrainer(trainerId: string) {
  const { data: session } = useAuthSession();
  const userId = session?.user?.id ?? null;

  return useQuery({
    queryKey: ["marketplace", "trainer", trainerId, userId],
    queryFn: () => marketplaceContainer.getTrainer.execute(trainerId, userId),
    enabled: session !== undefined && trainerId.length > 0,
  });
}