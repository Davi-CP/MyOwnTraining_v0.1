import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, ShieldCheck } from "lucide-react";
import { ProBottomNav } from "../shared/components/pro-bottom-nav";

export const Route = createFileRoute("/_private/pro/schedules")({
  component: ProSchedulesPage,
});

function ProSchedulesPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6 text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Agenda</p>
        <h1 className="mt-2 text-2xl font-bold">Sessões e recorrências</h1>

        <div className="mt-5 rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <CalendarRange className="h-5 w-5 text-[var(--brand-yellow)]" />
            <div>
              <p className="font-medium">Aprovação manual de recorrências</p>
              <p className="text-sm text-muted-foreground">O fluxo de agenda já está separado para aplicar conflitos, bloqueios e validações no servidor.</p>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[var(--brand-yellow)]" />
            <div>
              <p className="font-medium">Proteção de horário</p>
              <p className="text-sm text-muted-foreground">Horários bloqueados e disponibilidade estrita entram na etapa de domínio.</p>
            </div>
          </div>
        </div>
      </div>

      <ProBottomNav />
    </div>
  );
}
