import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { AuthGuard } from "../modules/auth/components/authGuard";
import { authContainer } from "../modules/auth/auth.container";

export const Route = createFileRoute("/_private")({
  component: PrivateLayout,
  beforeLoad: async () => {
    const session = await authContainer.getSession.execute();
    if (!session.user) {
      throw redirect({ to: "/" });
    }
    return session;
  },
});

function PrivateLayout() {
  return (
    <AuthGuard>
      <Outlet />
    </AuthGuard>
  );
}