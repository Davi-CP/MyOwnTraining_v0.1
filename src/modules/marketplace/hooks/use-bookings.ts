import { useQuery } from "@tanstack/react-query";
import { useAuthSession } from "../../auth/hooks/use-auth-session";
import { marketplaceContainer } from "../marketplace.container";

export function useBookings() {
  const { data: session } = useAuthSession();
  const userId = session?.user?.id ?? null;

  return useQuery({
    queryKey: ["marketplace", "bookings", userId],
    queryFn: () => marketplaceContainer.listBookings.execute(userId ?? ""),
    enabled: session !== undefined && userId != null,
  });
}