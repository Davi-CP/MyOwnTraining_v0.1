import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../shared/components/button";
import { useCreateBooking } from "../modules/marketplace/hooks/use-create-booking";
import { useTrainer } from "../modules/marketplace/hooks/use-trainer";
import { formatBRL } from "../shared/lib/utils";

export const Route = createFileRoute("/_private/booking/$id")({
  component: BookingPage,
  head: () => ({ meta: [{ title: "MyOwnTraining — Agendar treino" }] }),
});

const durations = [45, 60, 90];
const times = ["06:00", "07:00", "08:00", "09:00", "17:00", "18:00", "19:00", "20:00"];

function getBookingDates() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index + 1);
    return date;
  });
}

function BookingPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: trainer, isLoading } = useTrainer(id);
  const createBooking = useCreateBooking();
  const dates = getBookingDates();
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [time, setTime] = useState(times[1]);
  const [duration, setDuration] = useState(60);
  const [location, setLocation] = useState("");

  if (isLoading) return <PageMessage>Carregando profissional...</PageMessage>;
  if (!trainer) return <PageMessage>Profissional não encontrado.</PageMessage>;
  const selectedTrainer = trainer;

  const total = (selectedTrainer.pricePerHour * duration) / 60;
  const datetime = new Date(selectedDate);
  const [hours, minutes] = time.split(":").map(Number);
  datetime.setHours(hours, minutes, 0, 0);

  async function handleSubmit() {
    try {
      await createBooking.mutateAsync({
        trainerId: selectedTrainer.id,
        datetime: datetime.toISOString(),
        durationMinutes: duration,
        location,
        total,
      });
      toast.success("Treino agendado com sucesso.");
      await navigate({ to: "/bookings" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível agendar o treino.");
    }
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-5 flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Voltar">
            <Link to="/trainer/$id" params={{ id: trainer.id }}><ArrowLeft /></Link>
          </Button>
          <h1 className="text-xl font-bold">Agendar treino</h1>
        </div>

        <div className="mb-6 rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <p className="font-semibold">{trainer.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{formatBRL(trainer.pricePerHour)}/h · {trainer.specialties[0] ?? "Treino personalizado"}</p>
        </div>

        <FieldLabel>Data</FieldLabel>
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {dates.map((date) => {
            const selected = date.getTime() === selectedDate.getTime();
            return <button type="button" key={date.toISOString()} onClick={() => setSelectedDate(date)} className={`flex w-16 shrink-0 flex-col items-center rounded-2xl border py-3 text-xs ${selected ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white" : "border-border bg-card"}`}><span>{date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")}</span><strong className="text-lg">{date.getDate()}</strong></button>;
          })}
        </div>

        <FieldLabel>Horário</FieldLabel>
        <div className="mb-6 grid grid-cols-4 gap-2">
          {times.map((value) => <button type="button" key={value} onClick={() => setTime(value)} className={`rounded-xl border py-2.5 text-sm font-medium ${time === value ? "border-[var(--brand-yellow)] bg-[var(--brand-yellow)]" : "border-border bg-card"}`}>{value}</button>)}
        </div>

        <FieldLabel>Duração</FieldLabel>
        <div className="mb-6 grid grid-cols-3 gap-2">
          {durations.map((value) => <button type="button" key={value} onClick={() => setDuration(value)} className={`rounded-xl border py-2.5 text-sm font-medium ${duration === value ? "border-[var(--brand-yellow)] bg-[var(--brand-yellow)]" : "border-border bg-card"}`}>{value} min</button>)}
        </div>

        <FieldLabel>Local do treino</FieldLabel>
        <div className="relative mb-6"><MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Ex.: Parque ou endereço" className="h-12 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm outline-none focus:border-[var(--brand-yellow)]" /></div>

        <div className="mb-6 flex items-center justify-between rounded-2xl bg-muted/60 p-4"><span className="text-sm text-muted-foreground">Total da sessão</span><strong>{formatBRL(total)}</strong></div>
        <Button onClick={handleSubmit} disabled={createBooking.isPending} className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90"><CalendarDays />{createBooking.isPending ? "Agendando..." : `Confirmar · ${formatBRL(total)}`}</Button>
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{children}</h2>;
}

function PageMessage({ children }: { children: string }) {
  return <div className="min-h-screen bg-background px-5 py-16 text-center text-sm text-muted-foreground">{children}</div>;
}