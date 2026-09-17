import { useQuery } from "@tanstack/react-query";
import { marketplaceContainer } from "../marketplace.container";

export function useAdminMetrics() {
  return useQuery({
    queryKey: ["marketplace", "admin", "metrics"],
    queryFn: () => marketplaceContainer.getAdminMetrics.execute(),
  });
}