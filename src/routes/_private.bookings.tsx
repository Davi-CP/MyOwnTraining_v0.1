import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, CircleCheckBig } from "lucide-react";
import { BottomNav } from "../shared/components/bottom-nav";
import { Button } from "../shared/components/button";
import { formatBRL, formatDate, formatTime } from "../shared/lib/utils";
import { useBookings } from "../modules/marketplace/hooks/use-bookings";

export const Route = createFileRoute("/_private/bookings")({
  component: BookingsPage,
  head: () => ({ meta: [{ title: "MyOwnTraining — Treinos" }] }),
});

function BookingsPage() {
  const { data: bookings = [], isLoading } = useBookings();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6 text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Treinos</p>
        <h1 className="mt-2 text-2xl font-bold">Agenda</h1>

        <div className="mt-5 grid gap-3">
          {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Carregando treinos...</p>}
          {!isLoading && bookings.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum treino agendado.</p>
          )}
          {bookings.map((booking) => (
            <div key={booking.id} className="rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">{booking.trainerName}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(booking.datetime)} · {formatTime(booking.datetime)}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium capitalize text-muted-foreground">
                  {booking.status}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm font-semibold">
                  <CircleCheckBig className="h-4 w-4 text-[var(--brand-yellow)]" />
                  {formatBRL(booking.value)}
                </span>
                <Button asChild variant="outline" className="h-10 rounded-xl">
                  <Link to="/trainer/$id" params={{ id: booking.trainerId }}>
                    Detalhes
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-[var(--brand-yellow)]" />
            <div>
              <p className="font-medium">Próximo passo</p>
              <p className="text-sm text-muted-foreground">A agenda recorrente e o fluxo de cancelamento entram nas próximas entregas.</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}