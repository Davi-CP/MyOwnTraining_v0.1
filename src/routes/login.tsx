import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSignIn } from "../modules/auth/hooks/use-sign-in";

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn.mutateAsync({ email, password });
    navigate({ to: "/profile" });
  }

  return (
    <form onSubmit={onSubmit}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      <button type="submit" disabled={signIn.isPending}>
        Entrar
      </button>
    </form>
  );
}