import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar } from "lucide-react";
import { ProBottomNav } from "@/components/ProBottomNav";
import { useStored, KEYS, type RecurringBooking } from "@/lib/storage";

export const Route = createFileRoute("/pro/recurring")({
  component: ProRecurring,
  head: () => ({ meta: [{ title: "Agenda recorrente — MyOwnTraining" }] }),
});

function ProRecurring() {
  const [list] = useStored<RecurringBooking[]>(KEYS.recurringBookings, []);
  // pretend the logged-in trainer is t1 (Ricardo)
  const mine = list.filter((r) => r.trainerId === "t1" && r.active);

  // Build occupied slots view
  const slots: Record<string, string[]> = {};
  mine.forEach((r) =>
    r.days.forEach((d) => {
      slots[d] = [...(slots[d] || []), `${r.time} — ${r.clientName}`];
    }),
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/pro/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-xl font-bold">Agenda recorrente</h1>
        </div>

        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Alunos recorrentes</h2>
          {mine.length === 0 && <p className="rounded-2xl bg-card p-4 text-sm text-muted-foreground">Sem alunos recorrentes ainda.</p>}
          <div className="space-y-3">
            {mine.map((r) => (
              <div key={r.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
                <p className="font-semibold">{r.clientName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.days.join(", ")} · {r.time} · {r.place}</p>
                <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Desde {r.startDate} · R$ {r.value.toFixed(2)}/aula
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">Horários fixos ocupados</h2>
          <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
            {Object.keys(slots).length === 0 && <p className="text-sm text-muted-foreground">Nenhum horário fixo.</p>}
            {Object.entries(slots).map(([day, items]) => (
              <div key={day} className="border-b border-border py-2 last:border-0">
                <p className="text-xs font-semibold uppercase text-muted-foreground">{day}</p>
                {items.map((it, i) => <p key={i} className="text-sm">{it}</p>)}
              </div>
            ))}
          </div>
        </section>
      </div>
      <ProBottomNav />
    </div>
  );
}
