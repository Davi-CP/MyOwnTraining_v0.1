import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, Star, AlertTriangle, Siren, MapPinned, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BottomNav } from "@/components/BottomNav";
import { ReviewModal } from "@/components/ReviewModal";
import { Button } from "@/components/ui/button";
import { TRAINERS } from "@/lib/mock-data";
import {
  useStored, KEYS, DEFAULT_SESSIONS, DEFAULT_CLIENT_LOYALTY,
  pushNotification,
  type Session, type Review, type SafetyReport, type EmergencyAlert,
  type LiveLocation, type RefundLog, type PenaltyLog, type ClientLoyalty,
} from "@/lib/storage";

export const Route = createFileRoute("/bookings")({
  component: Bookings,
  head: () => ({ meta: [{ title: "Meus treinos — MyOwnTraining" }] }),
});

const REPORT_REASONS = [
  "Profissional não compareceu",
  "Cliente não compareceu",
  "Comportamento inadequado",
  "Preocupação com segurança",
  "Outro problema",
];

function Bookings() {
  const [sessions, setSessions] = useStored<Session[]>(KEYS.sessions, DEFAULT_SESSIONS);
  const [reviews] = useStored<Review[]>(KEYS.reviews, []);
  const [, setReports] = useStored<SafetyReport[]>(KEYS.safetyReports, []);
  const [, setAlerts] = useStored<EmergencyAlert[]>(KEYS.emergencyAlerts, []);
  const [, setLocations] = useStored<LiveLocation[]>(KEYS.liveLocations, []);
  const [, setRefunds] = useStored<RefundLog[]>(KEYS.refundLogs, []);
  const [, setPenalties] = useStored<PenaltyLog[]>(KEYS.penaltyLogs, []);
  const [loyalty, setLoyalty] = useStored<ClientLoyalty>(KEYS.clientLoyalty, DEFAULT_CLIENT_LOYALTY);
  const [reviewOf, setReviewOf] = useState<{ id: string; name: string } | null>(null);
  const [reportOf, setReportOf] = useState<Session | null>(null);
  const [cancelOf, setCancelOf] = useState<Session | null>(null);

  const report = (booking: Session, reason: string) => {
    setReports((prev) => [
      { id: `r-${Date.now()}`, bookingId: booking.id, reporter: "client", targetId: booking.trainerId, reason, date: Date.now() },
      ...prev,
    ]);
    if (reason === "Profissional não compareceu") {
      setRefunds((prev) => [{ id: `rf-${Date.now()}`, bookingId: booking.id, amount: booking.value, reason, date: Date.now() }, ...prev]);
      setSessions((prev) => prev.filter((s) => s.id !== booking.id));
      pushNotification({ audience: "client", title: "Reembolso processado", body: `R$ ${booking.value.toFixed(2)} estornado.` });
      toast.success("Reembolso automático aplicado");
    } else {
      toast.success("Reporte enviado para análise");
    }
    setReportOf(null);
  };

  const emergency = (booking: Session, type: EmergencyAlert["type"]) => {
    setAlerts((prev) => [{ id: `e-${Date.now()}`, bookingId: booking.id, type, date: Date.now() }, ...prev]);
    if (type === "share_location" && typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocations((prev) => [
          { bookingId: booking.id, sharedBy: "client", shareWith: "emergency",
            lat: pos.coords.latitude, lng: pos.coords.longitude, updatedAt: Date.now() },
          ...prev,
        ]);
      }, () => {});
    }
    toast.success(
      type === "call_support" ? "Conectando ao suporte…" :
      type === "send_alert" ? "Alerta enviado ao suporte" :
      "Localização compartilhada"
    );
  };

  const shareLocation = (booking: Session, target: "peer" | "emergency") => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Geolocalização indisponível"); return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocations((prev) => [
        { bookingId: booking.id, sharedBy: "client", shareWith: target,
          lat: pos.coords.latitude, lng: pos.coords.longitude, updatedAt: Date.now() },
        ...prev,
      ]);
      toast.success(target === "peer" ? "Localização enviada ao profissional" : "Localização enviada ao contato de emergência");
    }, () => toast.error("Não foi possível obter sua localização"));
  };

  const cancel = (booking: Session, withinPenalty: boolean) => {
    if (withinPenalty) {
      const fee = booking.value * 0.3;
      setPenalties((prev) => [{ id: `p-${Date.now()}`, bookingId: booking.id, userType: "client", amount: fee, reason: "Cancelamento <2h", date: Date.now() }, ...prev]);
      toast(`Multa de R$ ${fee.toFixed(2)} aplicada`);
    } else {
      toast.success("Treino cancelado sem custo");
    }
    setSessions((prev) => prev.filter((s) => s.id !== booking.id));
    pushNotification({ audience: "client", title: "Treino cancelado", body: "Seu agendamento foi cancelado." });
    pushNotification({ audience: "trainer", title: "Treino cancelado", body: "Um cliente cancelou um agendamento." });
    setCancelOf(null);
  };

  const markCompleted = (booking: Session) => {
    setSessions((prev) => prev.map((s) => s.id === booking.id ? { ...s, status: "completed" } : s));
    const next = loyalty.completedCount + 1;
    const unlocked = next >= 7;
    setLoyalty({ completedCount: unlocked ? 0 : next, pendingDiscount: unlocked || loyalty.pendingDiscount });
    if (unlocked) {
      pushNotification({ audience: "client", title: "Recompensa desbloqueada!", body: "50% OFF no seu próximo agendamento." });
      toast.success("Parabéns! 50% OFF desbloqueado no próximo treino.");
    } else {
      toast(`Treino concluído (${next}/7 para próxima recompensa)`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-8">
        <h1 className="text-2xl font-bold">Meus treinos</h1>
        <p className="text-sm text-muted-foreground">Próximos e histórico</p>

        {loyalty.pendingDiscount && (
          <div className="mt-4 rounded-2xl bg-[var(--brand-yellow)] p-3 text-center text-xs font-semibold">
            🎉 Você tem 50% OFF disponível no próximo agendamento
          </div>
        )}
        <p className="mt-3 text-[11px] text-muted-foreground">Fidelidade: {loyalty.completedCount}/7 treinos concluídos</p>

        <div className="mt-4 space-y-3">
          {sessions.map((b) => {
            const t = TRAINERS.find((x) => x.id === b.trainerId);
            if (!t) return null;
            const reviewed = reviews.some((r) => r.trainerId === t.id && r.author === "Você");
            const isCompleted = b.status === "completed";
            return (
              <div key={b.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
                <Link to="/trainer/$id" params={{ id: t.id }} className="flex items-center gap-3">
                  <img src={t.photo} alt="" className="h-14 w-14 rounded-xl bg-muted" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold">{t.name}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isCompleted ? "bg-green-100 text-green-700" : "bg-[var(--brand-yellow)]"
                      }`}>{isCompleted ? "Concluído" : "Confirmado"}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.specialties[0]}</p>
                  </div>
                </Link>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {b.date} · {b.time}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {b.duration} min</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.place}</span>
                </div>

                {!isCompleted && (
                  <>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button onClick={() => shareLocation(b, "peer")}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-[11px] font-medium">
                        <MapPinned className="h-3.5 w-3.5" /> Compartilhar local
                      </button>
                      <button onClick={() => setReportOf(b)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-[11px] font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" /> Reportar
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <details className="rounded-xl border border-destructive/40 bg-destructive/5">
                        <summary className="flex cursor-pointer items-center justify-center gap-1.5 py-2 text-[11px] font-semibold text-destructive">
                          <Siren className="h-3.5 w-3.5" /> Suporte emergencial
                        </summary>
                        <div className="space-y-1 p-2">
                          <button onClick={() => emergency(b, "call_support")} className="w-full rounded-lg bg-card py-1.5 text-[11px]">Ligar para suporte</button>
                          <button onClick={() => emergency(b, "send_alert")} className="w-full rounded-lg bg-card py-1.5 text-[11px]">Enviar alerta</button>
                          <button onClick={() => emergency(b, "share_location")} className="w-full rounded-lg bg-card py-1.5 text-[11px]">Compartilhar localização</button>
                        </div>
                      </details>
                      <button onClick={() => setCancelOf(b)}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-[11px] font-medium text-destructive">
                        <X className="h-3.5 w-3.5" /> Cancelar
                      </button>
                    </div>
                    <button onClick={() => markCompleted(b)}
                      className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--brand-black)] py-2 text-xs font-semibold text-white">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Marcar como concluído
                    </button>
                  </>
                )}

                {isCompleted && !reviewed && (
                  <button onClick={() => setReviewOf({ id: t.id, name: t.name })}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--brand-yellow)] py-2 text-xs font-semibold">
                    <Star className="h-3.5 w-3.5" /> Avaliar treino
                  </button>
                )}
                {isCompleted && reviewed && (
                  <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" /> Avaliado
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ReviewModal
        open={!!reviewOf}
        onClose={() => setReviewOf(null)}
        trainerId={reviewOf?.id ?? ""}
        trainerName={reviewOf?.name ?? ""}
      />

      {/* Report modal */}
      {reportOf && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setReportOf(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-background p-5 pb-8">
            <h2 className="mb-4 text-lg font-bold">Reportar problema</h2>
            <div className="space-y-2">
              {REPORT_REASONS.map((r) => (
                <button key={r} onClick={() => report(reportOf, r)}
                  className="block w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm">
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cancel modal */}
      {cancelOf && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setCancelOf(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-background p-5 pb-8">
            <h2 className="mb-2 text-lg font-bold">Cancelar treino</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Cancelamentos a menos de 2h do horário aplicam multa de 30%. Você confirma?
            </p>
            <div className="space-y-2">
              <Button onClick={() => cancel(cancelOf, false)} className="h-11 w-full rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
                Cancelar sem multa
              </Button>
              <Button onClick={() => cancel(cancelOf, true)} variant="outline" className="h-11 w-full rounded-xl">
                Cancelar com multa (menos de 2h)
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
