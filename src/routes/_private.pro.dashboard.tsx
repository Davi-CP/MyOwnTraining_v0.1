import { createFileRoute } from "@tanstack/react-router";
import { Bell, Wallet } from "lucide-react";
import { ProBottomNav } from "../shared/components/pro-bottom-nav";
import { Button } from "../shared/components/button";
import { formatBRL, formatDate, formatTime } from "../shared/lib/utils";
import { useProDashboard } from "../modules/marketplace/hooks/use-pro-dashboard";

export const Route = createFileRoute("/_private/pro/dashboard")({
  component: ProDashboardPage,
  head: () => ({ meta: [{ title: "MyOwnTraining — Dashboard PT" }] }),
});

function ProDashboardPage() {
  const { data: dashboard, isLoading } = useProDashboard();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="mx-auto max-w-md px-5 pt-6 text-left">
          <p className="py-10 text-center text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
        <ProBottomNav />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="mx-auto max-w-md px-5 pt-6 text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Profissional</p>
          <h1 className="mt-2 text-2xl font-bold">Dashboard</h1>
          <p className="mt-5 text-sm text-muted-foreground">
            Complete seu perfil profissional para visualizar as métricas.
          </p>
        </div>
        <ProBottomNav />
      </div>
    );
  }

  const metrics = [
    { label: "Saldo disponível", value: formatBRL(dashboard.saldoDisponivel) },
    { label: "Treinos concluídos", value: String(dashboard.treinosConcluidos) },
    { label: "Avaliação média", value: dashboard.avaliacao.toFixed(1) },
    { label: "Próximos treinos", value: String(dashboard.proximosAtendimentos) },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6 text-left">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Profissional</p>
            <h1 className="mt-2 text-2xl font-bold">Dashboard</h1>
          </div>
          <Button variant="outline" className="h-11 rounded-full px-3">
            <Bell className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-lg font-bold">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-[var(--brand-yellow)]" />
            <div>
              <p className="font-medium">Carteira e saque</p>
              <p className="text-sm text-muted-foreground">Estrutura pronta para saldo disponível, extrato e validação facial no saque.</p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <h2 className="text-base font-semibold">Próximos atendimentos</h2>
          {dashboard.proximos.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum atendimento agendado.</p>
          )}
          {dashboard.proximos.map((session) => (
            <div key={session.id} className="rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
              <p className="text-sm font-semibold">{session.clienteNome}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDate(session.datetime)} · {formatTime(session.datetime)} · {formatBRL(session.value)}
              </p>
            </div>
          ))}
        </div>
      </div>

      <ProBottomNav />
    </div>
  );
}