import { createFileRoute, Link } from "@tanstack/react-router";
import { TrendingUp, Calendar, MessageCircle, Star, Bell, ArrowUpRight, Check, X, Repeat } from "lucide-react";
import { TRAINERS } from "@/lib/mock-data";
import { ProBottomNav } from "@/components/ProBottomNav";
import {
  useStored,
  KEYS,
  STUDENTS,
  DEFAULT_PRO_REQUESTS,
  DEFAULT_PRO_SCHEDULES,
  DEFAULT_SESSIONS,
  DEFAULT_WALLET,
  hasTrainerConflict,
  pushNotification,
  type ProRequest,
  type ProSchedule,
  type Session,
  type BlockedUser,
  type RecurringRequest,
  type RecurringBooking,
  type WalletState,
} from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/dashboard")({
  component: ProDashboard,
  head: () => ({ meta: [{ title: "Dashboard profissional — MyOwnTraining" }] }),
});

function ProDashboard() {
  const me = TRAINERS[0];
  const [requests, setRequests] = useStored<ProRequest[]>(KEYS.proRequests, DEFAULT_PRO_REQUESTS);
  const [schedules, setSchedules] = useStored<ProSchedule[]>(KEYS.proSchedules, DEFAULT_PRO_SCHEDULES);
  const [sessions] = useStored<Session[]>(KEYS.sessions, DEFAULT_SESSIONS);
  const [blocked] = useStored<BlockedUser[]>(KEYS.blockedUsers, []);
  const [recRequests, setRecRequests] = useStored<RecurringRequest[]>(KEYS.recurringRequests, []);
  const [recBookings, setRecBookings] = useStored<RecurringBooking[]>(KEYS.recurringBookings, []);
  const [wallet] = useStored<WalletState>(KEYS.wallet, DEFAULT_WALLET);

  const pendingRec = recRequests.filter((r) => r.status === "pending" && r.trainerId === me.id);

  const accept = (r: ProRequest) => {
    if (blocked.some((b) => b.targetId === r.studentId)) {
      toast.error("Você bloqueou este aluno"); return;
    }
    const [date = r.when, time = ""] = r.when.split(" · ");
    if (hasTrainerConflict(schedules, sessions, me.id, date, time)) {
      toast.error("Este horário já está indisponível"); return;
    }
    setSchedules([...schedules, { ...r, date, time }]);
    setRequests(requests.filter((x) => x.id !== r.id));
    pushNotification({ audience: "client", title: "Treino aceito", body: "Seu personal confirmou o agendamento." });
    pushNotification({ audience: "trainer", title: "Pagamento aprovado", body: `R$ ${r.value.toFixed(2)} reservado.` });
    toast.success("Treino aceito", { description: "Movido para Agendamentos." });
  };
  const reject = (r: ProRequest) => {
    setRequests(requests.filter((x) => x.id !== r.id));
    pushNotification({ audience: "client", title: "Treino recusado", body: "Tente outro horário ou profissional." });
    toast("Pedido recusado");
  };

  const acceptRecurring = (r: RecurringRequest) => {
    const conflict = recBookings.some(
      (b) => b.active && b.trainerId === r.trainerId && b.time === r.time && b.days.some((d) => r.days.includes(d)),
    );
    if (conflict) { toast.error("Conflito de agenda detectado"); return; }
    const booking: RecurringBooking = {
      id: `r-${Date.now()}`,
      clientId: r.clientId, clientName: r.clientName,
      trainerId: r.trainerId, trainerName: r.trainerName,
      days: r.days, time: r.time, duration: r.duration, place: r.place,
      value: r.value, startDate: r.startDate, active: true, createdAt: Date.now(),
    };
    setRecBookings([booking, ...recBookings]);
    // also add visible session entries to schedules
    const extra: ProSchedule[] = r.days.map((d, i) => ({
      id: `rs-${Date.now()}-${i}`,
      studentId: r.clientId,
      when: `${d} · ${r.time}`,
      date: d, time: r.time,
      duration: `${r.duration} min`, value: r.value, place: r.place,
    }));
    setSchedules([...schedules, ...extra]);
    setRecRequests(recRequests.map((x) => x.id === r.id ? { ...x, status: "accepted" } : x));
    pushNotification({ audience: "client", title: "Treino recorrente aceito", body: `${r.trainerName} confirmou seu plano.` });
    toast.success("Recorrência aceita");
  };
  const rejectRecurring = (r: RecurringRequest) => {
    setRecRequests(recRequests.map((x) => x.id === r.id ? { ...x, status: "rejected" } : x));
    pushNotification({ audience: "client", title: "Treino recorrente recusado", body: "Tente outro horário ou profissional." });
    toast("Pedido recorrente recusado");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md">
        <header className="bg-[var(--brand-black)] px-5 pt-8 pb-20 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={me.photo} alt="" className="h-12 w-12 rounded-full bg-white" />
              <div>
                <p className="text-xs opacity-70">Olá,</p>
                <p className="font-semibold">{me.name}</p>
              </div>
            </div>
            <Link to="/pro/notifications" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Bell className="h-5 w-5" />
            </Link>
          </div>
          <Link to="/pro/wallet" className="mt-6 block text-left">
            <p className="text-sm opacity-70">Saldo disponível</p>
            <p className="text-4xl font-bold">R$ {Math.floor(wallet.available).toLocaleString("pt-BR")}<span className="text-lg opacity-70">,{(wallet.available % 1).toFixed(2).slice(2)}</span></p>
            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--brand-yellow)]">
              <ArrowUpRight className="h-3 w-3" /> Disponível para saque · ver carteira
            </p>
          </Link>
        </header>

        <div className="-mt-12 grid grid-cols-3 gap-2 px-5">
          {[
            { icon: Calendar, v: String(schedules.length), l: "Agendados", to: "/pro/schedules" as const },
            { icon: Star, v: me.rating, l: "Avaliação", to: "/pro/reviews" as const },
            { icon: MessageCircle, v: "3", l: "Chats", to: "/pro/chats" as const },
          ].map((s) => (
            <Link key={s.l} to={s.to} className="rounded-2xl bg-card p-3 text-center shadow-[var(--shadow-soft)] transition-transform active:scale-95">
              <s.icon className="mx-auto h-4 w-4 text-muted-foreground" />
              <p className="mt-1 text-lg font-bold">{s.v}</p>
              <p className="text-[10px] text-muted-foreground">{s.l}</p>
            </Link>
          ))}
        </div>

        <section className="mt-8 px-5">
          <h2 className="mb-3 flex items-center justify-between text-base font-semibold">
            Novos pedidos
            <span className="rounded-full bg-[var(--brand-yellow)] px-2 py-0.5 text-xs">{requests.length + pendingRec.length}</span>
          </h2>
          {requests.length === 0 && pendingRec.length === 0 && (
            <p className="rounded-2xl bg-card p-4 text-center text-sm text-muted-foreground shadow-[var(--shadow-soft)]">
              Nenhum pedido pendente.
            </p>
          )}
          <div className="space-y-3">
            {requests.map((r) => {
              const student = STUDENTS.find((s) => s.id === r.studentId);
              return (
                <div key={r.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{student?.name ?? "Aluno"}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{r.when} · {r.duration}</p>
                      <p className="text-xs text-muted-foreground">{r.place}</p>
                    </div>
                    <p className="text-base font-bold">R$ {r.value.toFixed(2)}</p>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => reject(r)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-sm font-medium"
                    >
                      <X className="h-4 w-4" /> Recusar
                    </button>
                    <button
                      onClick={() => accept(r)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--brand-yellow)] py-2 text-sm font-semibold"
                    >
                      <Check className="h-4 w-4" /> Aceitar
                    </button>
                  </div>
                </div>
              );
            })}
            {pendingRec.map((r) => (
              <div key={r.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Repeat className="h-3.5 w-3.5 text-[var(--brand-black)]" />
                      <p className="font-semibold">{r.clientName}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{r.days.join(" / ")}</p>
                    <p className="text-xs text-muted-foreground">{r.time} · {r.duration} min · {r.days.length}x/semana</p>
                    <p className="text-xs text-muted-foreground">{r.place}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold">R$ {(r.value * r.days.length).toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">por semana</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => rejectRecurring(r)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-sm font-medium">
                    <X className="h-4 w-4" /> Recusar
                  </button>
                  <button onClick={() => acceptRecurring(r)} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--brand-yellow)] py-2 text-sm font-semibold">
                    <Check className="h-4 w-4" /> Aceitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 px-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Performance</h2>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-3 space-y-2">
            {[
              { l: "Treinos esta semana", v: "12 / 15" },
              { l: "Taxa de aceitação", v: "94%" },
              { l: "Assinatura", v: "Premium" },
            ].map((s) => (
              <div key={s.l} className="flex items-center justify-between rounded-2xl bg-card p-4 text-sm shadow-[var(--shadow-soft)]">
                <span className="text-muted-foreground">{s.l}</span>
                <span className="font-semibold">{s.v}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 px-5">
          <Link to="/pro/coupons" className="mb-3 block rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cupons</p>
            <p className="mt-1 text-base font-bold">Cupons, recargas e convites</p>
            <p className="mt-1 text-xs text-muted-foreground">Aplique cupons, resgate cartões físicos e convide colegas.</p>
          </Link>
          <Link to="/pro/boost" className="block rounded-2xl bg-gradient-to-br from-[var(--brand-yellow)] to-[#FFD740] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-70">Impulsionar</p>
            <p className="mt-1 text-base font-bold">Apareça no topo do mapa</p>
            <p className="mt-1 text-xs opacity-80">Aumente até 3x sua visibilidade na sua região.</p>
          </Link>
        </section>


        <section className="mt-4 grid grid-cols-2 gap-3 px-5">
          <Link to="/pro/help" className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-bold">Ajuda</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Dúvidas sobre pagamentos, agendamentos ou funcionamento do app.</p>
          </Link>
          <Link to="/pro/support" className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-bold">Suporte</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Relate um problema diretamente para o administrador.</p>
          </Link>
          <Link to="/pro/security" className="col-span-2 rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-bold">Segurança e privacidade</p>
            <p className="mt-1 text-[11px] text-muted-foreground">Senha, notificações, termos, política e exclusão de conta.</p>
          </Link>
        </section>

        <Link to="/" className="mx-5 mt-6 block rounded-xl border border-border bg-card py-3 text-center text-sm font-medium">
          Voltar ao login
        </Link>
      </div>
      <ProBottomNav />
    </div>
  );
}
