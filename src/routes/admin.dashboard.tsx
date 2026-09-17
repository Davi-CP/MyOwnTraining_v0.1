import { createFileRoute, redirect } from "@tanstack/react-router";
import { AlertTriangle, BadgeCheck, ShieldCheck, Users } from "lucide-react";
import { authContainer } from "../modules/auth/auth.container";
import { Button } from "../shared/components/button";
import { useAdminMetrics } from "../modules/marketplace/hooks/use-admin-metrics";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardPage,
  beforeLoad: async () => {
    const session = await authContainer.getSession.execute();
    if (!session.user) {
      throw redirect({ to: "/" });
    }
    if (!session.roles.includes("admin") && session.primaryRole !== "admin") {
      throw redirect({ to: "/home" });
    }
    return session;
  },
});

function AdminDashboardPage() {
  const { data: metrics, isLoading } = useAdminMetrics();

  const cards = [
    { label: "Usuários", value: metrics ? String(metrics.usuarios) : "—", icon: Users },
    { label: "CREF", value: metrics ? `${metrics.crefPendentes} pendentes` : "—", icon: BadgeCheck },
    { label: "Chamados", value: metrics ? `${metrics.chamadosAbertos} abertos` : "—", icon: AlertTriangle },
    { label: "Segurança", value: "OK", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto max-w-md px-5 pt-6 text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Admin</p>
        <h1 className="mt-2 text-2xl font-bold">Painel administrativo</h1>

        {isLoading && <p className="mt-4 text-sm text-muted-foreground">Carregando métricas...</p>}

        <div className="mt-5 grid grid-cols-2 gap-3">
          {cards.map((metric) => (
            <div key={metric.label} className="rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
              <metric.icon className="h-5 w-5 text-[var(--brand-yellow)]" />
              <p className="mt-3 text-[11px] uppercase tracking-wide text-muted-foreground">{metric.label}</p>
              <p className="mt-1 text-lg font-bold">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-3xl bg-card p-5 shadow-[var(--shadow-soft)]">
          <p className="font-medium">Proteção ativa</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Esta rota valida autenticação e papel no carregamento, antes de renderizar o conteúdo.
          </p>
          <Button className="mt-4 h-11 rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
            Ver fila de validações
          </Button>
        </div>
      </div>
    </div>
  );
}