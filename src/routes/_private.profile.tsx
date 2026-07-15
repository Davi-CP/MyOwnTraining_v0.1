import { createFileRoute } from "@tanstack/react-router";
import { useAuthSession } from "../modules/auth/hooks/use-auth-session";
import { useSignOut } from "../modules/auth/hooks/use-sign-out";

export const Route = createFileRoute("/_private/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data } = useAuthSession();
  const signOut = useSignOut();

  return (
    <div>
      <h1>Profile</h1>
      <p>Usuário: {data?.user?.email}</p>
      <button onClick={() => signOut.mutate()}>Sair</button>
    </div>
  );
}