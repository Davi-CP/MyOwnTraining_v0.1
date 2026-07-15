import { Outlet, createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "../modules/auth/components/authGuard";

export const Route = createFileRoute("/_private")({
  component: PrivateLayout,
});

function PrivateLayout() {
  return (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  );
}