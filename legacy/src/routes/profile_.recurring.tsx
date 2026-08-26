import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus, X, Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BottomNav } from "@/components/BottomNav";
import { TRAINERS } from "@/lib/mock-data";
import { useStored, KEYS, pushNotification, type RecurringBooking, type RecurringRequest } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/profile_/recurring")({
  component: ClientRecurring,
  head: () => ({ meta: [{ title: "Treinos recorrentes — MyOwnTraining" }] }),
});

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function ClientRecurring() {
  const [list, setList] = useStored<RecurringBooking[]>(KEYS.recurringBookings, []);
  const [requests, setRequests] = useStored<RecurringRequest[]>(KEYS.recurringRequests, []);
  const [open, setOpen] = useState(false);
  const [trainerId, setTrainerId] = useState(TRAINERS[0]?.id ?? "");
  const [days, setDays] = useState<string[]>(["Seg", "Qua"]);
  const [time, setTime] = useState("18:00");
  const [place, setPlace] = useState("Parque Villa-Lobos");
  const [startDate, setStartDate] = useState("");

  const mine = list.filter((r) => r.clientId === "me");
  const myRequests = requests.filter((r) => r.clientId === "me");

  const toggleDay = (d: string) =>
    setDays((p) => (p.includes(d) ? p.filter((x) => x !== d) : [...p, d]));

  const save = () => {
    if (!trainerId || days.length === 0 || !time || !startDate) {
      return toast.error("Preencha todos os campos");
    }
    const trainer = TRAINERS.find((t) => t.id === trainerId)!;
    const conflictTrainer = list.some(
      (r) => r.active && r.trainerId === trainerId && r.time === time && r.days.some((d) => days.includes(d)),
    );
    if (conflictTrainer) {
      return toast.error("Horário indisponível");
    }
    const req: RecurringRequest = {
      id: `rr-${Date.now()}`,
      clientId: "me",
      clientName: "Marina Castro",
      trainerId,
      trainerName: trainer.name,
      days,
      time,
      duration: 60,
      place,
      value: trainer.pricePerHour,
      startDate,
      status: "pending",
      createdAt: Date.now(),
    };
    setRequests([req, ...requests]);
    pushNotification({ audience: "trainer", title: "Novo pedido recorrente", body: `${req.clientName} solicitou treinos recorrentes.` });
    setOpen(false);
    toast.success("Pedido enviado ao profissional");
  };

  const cancel = (id: string) => {
    setList(list.map((r) => (r.id === id ? { ...r, active: false } : r)));
    toast.success("Plano cancelado");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-xl font-bold">Treinos recorrentes</h1>
        </div>

        <Button onClick={() => setOpen(true)} className="mb-4 h-11 w-full rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
          <Plus className="mr-2 h-4 w-4" /> Novo plano recorrente
        </Button>

        {myRequests.length > 0 && (
          <div className="mb-4 space-y-2">
            <h2 className="text-xs font-semibold uppercase text-muted-foreground">Pedidos pendentes</h2>
            {myRequests.map((r) => (
              <div key={r.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{r.trainerName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    r.status === "pending" ? "bg-[var(--brand-yellow)]/30 text-[var(--brand-black)]" :
                    r.status === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>{r.status === "pending" ? "Aguardando" : r.status === "accepted" ? "Aceito" : "Recusado"}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{r.days.join(" / ")} · {r.time} · {r.days.length}x por semana</p>
              </div>
            ))}
          </div>
        )}

        {mine.length === 0 && myRequests.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Nenhum treino recorrente.</p>}

        <div className="space-y-3">
          {mine.map((r) => (
            <div key={r.id} className={`rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)] ${!r.active ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold">{r.trainerName}</p>
                <p className="text-sm font-bold">R$ {r.value.toFixed(2)}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.days.join(", ")} · {r.time} · {r.place}</p>
              <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Início: {r.startDate}</p>
              {r.active && (
                <button onClick={() => cancel(r.id)} className="mt-3 text-xs font-semibold text-destructive">Cancelar plano</button>
              )}
              {!r.active && <p className="mt-3 text-xs font-semibold text-muted-foreground">Cancelado</p>}
            </div>
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full rounded-t-3xl bg-background p-5 pb-8 max-h-[85vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">Novo plano</h2>
              <button onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Profissional</label>
                <select value={trainerId} onChange={(e) => setTrainerId(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm">
                  {TRAINERS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Dias da semana</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => (
                    <button key={d} type="button" onClick={() => toggleDay(d)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                        days.includes(d) ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white" : "border-border bg-card text-muted-foreground"
                      }`}>{d}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Horário</label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Local</label>
                <Input value={place} onChange={(e) => setPlace(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-muted-foreground">Início</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-11 rounded-xl" />
              </div>
              <Button onClick={save} className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
                Confirmar reserva
              </Button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}
