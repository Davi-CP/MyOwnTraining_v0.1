import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TRAINERS } from "@/lib/mock-data";
import {
  useStored, KEYS, DEFAULT_SESSIONS, DEFAULT_PRO_SCHEDULES, DEFAULT_CLIENT_LOYALTY,
  hasClientConflict, hasTrainerConflict, isWithinTrainerAvailability,
  type Session, type ProSchedule, type BlockedUser, type ClientLoyalty,
  type TrainerUnavailableSlot,
} from "@/lib/storage";

export const Route = createFileRoute("/booking/$id")({
  component: BookingPage,
  loader: ({ params }) => {
    const trainer = TRAINERS.find((t) => t.id === params.id);
    if (!trainer) throw notFound();
    return { trainer };
  },
  head: () => ({ meta: [{ title: "Agendar treino — MyOwnTraining" }] }),
});

const dates = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date(); d.setDate(d.getDate() + i);
  return d;
});
const times = ["06:00", "07:00", "08:00", "09:00", "17:00", "18:00", "19:00", "20:00"];
const durations = [45, 60, 90];

function BookingPage() {
  const { trainer } = Route.useLoaderData() as { trainer: typeof TRAINERS[number] };
  const nav = useNavigate();
  const [date, setDate] = useState(0);
  const [time, setTime] = useState("07:00");
  const [duration, setDuration] = useState(60);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState("Parque Villa-Lobos, São Paulo");
  const [sessions] = useStored<Session[]>(KEYS.sessions, DEFAULT_SESSIONS);
  const [proSchedules] = useStored<ProSchedule[]>(KEYS.proSchedules, DEFAULT_PRO_SCHEDULES);
  const [blocked] = useStored<BlockedUser[]>(KEYS.blockedUsers, []);
  const [loyalty] = useStored<ClientLoyalty>(KEYS.clientLoyalty, DEFAULT_CLIENT_LOYALTY);
  const [unavailable] = useStored<TrainerUnavailableSlot[]>(KEYS.trainerUnavailable, []);

  const selDate = dates[date];
  const dateLabel = selDate.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
  const weekdayShort = selDate.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  const perPerson = (trainer.pricePerHour * duration) / 60;
  const subtotal = perPerson * quantity;
  const discount = loyalty.pendingDiscount ? subtotal * 0.5 : 0;
  const discounted = subtotal - discount;
  const fee = discounted * 0.15;
  const total = discounted + fee;
  const trainerReceives = discounted - fee;

  const isBlocked = blocked.some((b) => b.targetId === trainer.id);
  const conflict =
    hasClientConflict(sessions, dateLabel, time) ||
    hasTrainerConflict(proSchedules, sessions, trainer.id, dateLabel, time);
  const withinAvailability = isWithinTrainerAvailability(trainer.availability, weekdayShort, time);
  const manualBlocked = unavailable.some(
    (u) => u.trainerId === trainer.id && u.date === dateLabel && (!u.time || u.time === time),
  );
  const unavailableSlot = !withinAvailability || manualBlocked;

  const onContinue = () => {
    if (isBlocked) { toast.error("Você bloqueou este profissional"); return; }
    if (unavailableSlot) { toast.error("Horário indisponível"); return; }
    if (conflict) { toast.error("Este horário já está indisponível"); return; }
    try {
      sessionStorage.setItem("mot:pendingBooking", JSON.stringify({
        trainerId: trainer.id, date: dateLabel, time, duration, place: address, quantity,
        subtotal, discount, fee, total, value: discounted,
      }));
    } catch { /* ignore */ }
    nav({ to: "/parq", search: { id: trainer.id } });
  };


  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/trainer/$id" params={{ id: trainer.id }} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Agendar treino</h1>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]">
          <img src={trainer.photo} alt="" className="h-14 w-14 rounded-xl bg-muted" />
          <div>
            <p className="font-semibold">{trainer.name}</p>
            <p className="text-xs text-muted-foreground">R$ {trainer.pricePerHour}/h · {trainer.specialties[0]}</p>
          </div>
        </div>

        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quantidade de pessoas</h2>
        <div className="mb-5 grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((q) => (
            <button key={q} onClick={() => setQuantity(q)}
              className={`rounded-xl border py-2.5 text-sm font-medium ${quantity === q ? "border-[var(--brand-yellow)] bg-[var(--brand-yellow)]" : "border-border bg-card"}`}>
              {q}
            </button>
          ))}
        </div>

        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Data</h2>
        <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {dates.map((d, i) => (
            <button key={i} onClick={() => setDate(i)}
              className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-3 text-xs ${
                date === i ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white" : "border-border bg-card"
              }`}>
              <span className="opacity-70">{d.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0,3)}</span>
              <span className="text-lg font-bold">{d.getDate()}</span>
            </button>
          ))}
        </div>


        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Horário</h2>
        <div className="mb-5 grid grid-cols-4 gap-2">
          {times.map((t) => {
            const available = isWithinTrainerAvailability(trainer.availability, weekdayShort, t)
              && !unavailable.some((u) => u.trainerId === trainer.id && u.date === dateLabel && (!u.time || u.time === t));
            return (
              <button key={t} onClick={() => setTime(t)} disabled={!available}
                title={!available ? "Horário indisponível" : undefined}
                className={`rounded-xl border py-2.5 text-sm font-medium ${
                  !available ? "border-border bg-muted text-muted-foreground line-through opacity-50" :
                  time === t ? "border-[var(--brand-yellow)] bg-[var(--brand-yellow)]" : "border-border bg-card"
                }`}>{t}</button>
            );
          })}
        </div>

        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Duração</h2>
        <div className="mb-5 grid grid-cols-3 gap-2">
          {durations.map((d) => (
            <button key={d} onClick={() => setDuration(d)}
              className={`rounded-xl border py-2.5 text-sm font-medium ${
                duration === d ? "border-[var(--brand-yellow)] bg-[var(--brand-yellow)]" : "border-border bg-card"
              }`}>{d} min</button>
          ))}
        </div>

        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Local do treino</h2>
        <div className="relative mb-6">
          <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={address} onChange={(e) => setAddress(e.target.value)}
            className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-[var(--brand-yellow)]" />
        </div>

        <div className="rounded-2xl bg-muted/60 p-4 text-sm">
          <Row label="Valor por pessoa" value={`R$ ${perPerson.toFixed(2)}`} />
          <Row label="Participantes" value={`${quantity}`} />
          <Row label="Subtotal" value={`R$ ${subtotal.toFixed(2)}`} />
          {discount > 0 && <Row label="Recompensa fidelidade (-50%)" value={`- R$ ${discount.toFixed(2)}`} />}
          <Row label="Taxa da plataforma (15%)" value={`R$ ${fee.toFixed(2)}`} />
          <Row label="Profissional recebe" value={`R$ ${trainerReceives.toFixed(2)}`} />
          <div className="mt-2 border-t border-border pt-2">
            <Row label="Total" value={`R$ ${total.toFixed(2)}`} bold />
          </div>
        </div>


        {(conflict || isBlocked || unavailableSlot) && (
          <p className="mt-3 rounded-xl bg-destructive/10 px-4 py-2 text-center text-xs font-medium text-destructive">
            {isBlocked ? "Você bloqueou este profissional." :
             unavailableSlot ? "Horário indisponível" :
             "Este horário já está indisponível"}
          </p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md px-5 py-3">
          <Button onClick={onContinue} disabled={conflict || isBlocked || unavailableSlot}
            className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90 disabled:opacity-40">
            Continuar · R$ {total.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1 ${bold ? "font-semibold text-base" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
