import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, X, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { ProBottomNav } from "@/components/ProBottomNav";
import { Button } from "@/components/ui/button";
import {
  useStored,
  KEYS,
  STUDENTS,
  DEFAULT_PRO_SCHEDULES,
  DEFAULT_WALLET,
  pushNotification,
  type ProSchedule,
  type WalletState,
  type WalletTx,
  type RefundLog,
  type PenaltyLog,
} from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/schedules")({
  component: ProSchedules,
  head: () => ({ meta: [{ title: "Agendamentos — MyOwnTraining" }] }),
});

function bucket(date: string): "Hoje" | "Amanhã" | "Próximos dias" {
  const d = date.trim().toLowerCase();
  if (d === "hoje") return "Hoje";
  if (d === "amanhã" || d === "amanha") return "Amanhã";
  return "Próximos dias";
}

function ProSchedules() {
  const [schedules, setSchedules] = useStored<ProSchedule[]>(KEYS.proSchedules, DEFAULT_PRO_SCHEDULES);
  const [wallet, setWallet] = useStored<WalletState>(KEYS.wallet, DEFAULT_WALLET);
  const [tx, setTx] = useStored<WalletTx[]>(KEYS.walletTx, []);
  const [refunds, setRefunds] = useStored<RefundLog[]>(KEYS.refundLogs, []);
  const [penalties, setPenalties] = useStored<PenaltyLog[]>(KEYS.penaltyLogs, []);
  const [confirm, setConfirm] = useState<ProSchedule | null>(null);

  const groups: Record<string, ProSchedule[]> = { Hoje: [], "Amanhã": [], "Próximos dias": [] };
  schedules.forEach((s) => groups[bucket(s.date)].push(s));

  const isLate = (sc: ProSchedule) => bucket(sc.date) === "Hoje";

  const doCancel = (sc: ProSchedule) => {
    const late = isLate(sc);
    const penalty = late ? Number((sc.value * 0.3).toFixed(2)) : 0;
    setSchedules(schedules.filter((s) => s.id !== sc.id));
    setRefunds([
      { id: `rf-${Date.now()}`, bookingId: sc.id, amount: sc.value, reason: "Cancelado pelo profissional", date: Date.now() },
      ...refunds,
    ]);
    if (late) {
      setPenalties([
        { id: `pn-${Date.now()}`, bookingId: sc.id, userType: "trainer", amount: penalty, reason: "Cancelamento <2h", date: Date.now() },
        ...penalties,
      ]);
      setWallet({ ...wallet, available: Math.max(0, wallet.available - penalty) });
      setTx([
        { id: `tx-${Date.now()}`, type: "fee", value: penalty, date: Date.now(), status: "completed", description: `Taxa cancelamento — ${sc.id}` },
        ...tx,
      ]);
    }
    pushNotification({ audience: "client", title: "Treino cancelado", body: late ? "Reembolso integral processado automaticamente." : "Você foi notificado pelo profissional." });
    pushNotification({ audience: "trainer", title: "Treino cancelado", body: late ? `Taxa de 30% aplicada (R$ ${penalty.toFixed(2)}).` : "Cancelamento sem taxa." });
    toast.success(late ? `Cancelado · taxa R$ ${penalty.toFixed(2)}` : "Treino cancelado");
    setConfirm(null);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <h1 className="mb-4 text-xl font-bold">Agendamentos</h1>

        {schedules.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nenhum treino agendado. Aceite novos pedidos no Dashboard.
          </p>
        )}

        {(["Hoje", "Amanhã", "Próximos dias"] as const).map((g) =>
          groups[g].length > 0 ? (
            <div key={g} className="mb-5">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g}</h2>
              <div className="space-y-3">
                {groups[g].map((sc) => {
                  const s = STUDENTS.find((x) => x.id === sc.studentId);
                  return (
                    <div key={sc.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={s?.photo} alt="" className="h-12 w-12 rounded-xl bg-muted" />
                          <div>
                            <p className="font-semibold">
                              {s?.name ?? "Aluno"}
                              {sc.quantity && sc.quantity > 1 && (
                                <span className="ml-2 rounded-full bg-[var(--brand-yellow)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--brand-black)] align-middle">
                                  Treino em grupo · {sc.quantity}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{sc.duration}</p>
                          </div>
                        </div>
                        <p className="text-base font-bold">R$ {sc.value.toFixed(2)}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {sc.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {sc.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {sc.place}</span>
                      </div>
                      <button
                        onClick={() => setConfirm(sc)}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs font-medium text-red-600"
                      >
                        <X className="h-3.5 w-3.5" /> Cancelar treino
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null,
        )}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-background p-5 pb-8">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[var(--brand-yellow)]" />
              <h2 className="text-lg font-bold">Confirmar cancelamento</h2>
            </div>
            {isLate(confirm) ? (
              <p className="mb-5 text-sm text-muted-foreground">
                Cancelamentos com menos de 2 horas geram taxa de 30% (R$ {(confirm.value * 0.3).toFixed(2)}) e reembolso automático do aluno.
              </p>
            ) : (
              <p className="mb-5 text-sm text-muted-foreground">
                O treino será cancelado e o aluno notificado. Reembolso integral será processado.
              </p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setConfirm(null)} className="h-12 flex-1 rounded-xl">
                Voltar
              </Button>
              <Button onClick={() => doCancel(confirm)} className="h-12 flex-1 rounded-xl bg-red-600 text-white hover:bg-red-700">
                Cancelar treino
              </Button>
            </div>
          </div>
        </div>
      )}

      <ProBottomNav />
    </div>
  );
}
