import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users, ShieldCheck, CalendarDays, DollarSign, AlertTriangle, BarChart3,
  Check, X, Ban, FileText, LogOut, Tag, LifeBuoy, UserCog, Clock, Trash2, Gift, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useStored, KEYS, ADMIN_PERMISSIONS, ADMIN_COUPON_TEMPLATES, DEFAULT_USER_ACTIVITY,
  pushNotification,
  type ClientAccount, type ProAccount, type RecurringBooking,
  type SafetyReport, type BlockedUser, type EmergencyAlert,
  type RefundLog, type ProBoost, type CustomModalityRequest,
  type SupportTicket, type SupportTicketPriority,
  type AdminUser, type AdminPermission, type UserActivity,
  type AdminCoupon, type ReengagementLog,
} from "@/lib/storage";
import { TRAINERS } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin — MyOwnTraining" }] }),
});

type Tab = "overview" | "users" | "validation" | "bookings" | "payments" | "reports" | "modalities" | "support" | "admins" | "inactive";

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [clients, setClients] = useStored<ClientAccount[]>(KEYS.clientAccounts, []);
  const [pros, setPros] = useStored<ProAccount[]>(KEYS.proAccounts, []);
  const [recurring] = useStored<RecurringBooking[]>(KEYS.recurringBookings, []);
  const [reports] = useStored<SafetyReport[]>(KEYS.safetyReports, []);
  const [blocked] = useStored<BlockedUser[]>(KEYS.blockedUsers, []);
  const [alerts] = useStored<EmergencyAlert[]>(KEYS.emergencyAlerts, []);
  const [refunds] = useStored<RefundLog[]>(KEYS.refundLogs, []);
  const [boost] = useStored<ProBoost>(KEYS.proBoost, { active: false, plan: null, startDate: null, endDate: null });
  const [customMods, setCustomMods] = useStored<CustomModalityRequest[]>(KEYS.customModalities, []);
  const [tickets, setTickets] = useStored<SupportTicket[]>(KEYS.supportTickets, []);
  const [admins, setAdmins] = useStored<AdminUser[]>(KEYS.admins, []);
  const [activity] = useStored<UserActivity[]>(KEYS.userActivity, DEFAULT_USER_ACTIVITY);
  const [adminCoupons, setAdminCoupons] = useStored<AdminCoupon[]>(KEYS.adminCoupons, []);
  const [reengagement, setReengagement] = useStored<ReengagementLog[]>(KEYS.adminReengagement, []);
  const [reply, setReply] = useState<Record<string, string>>({});
  const [confirmBlock, setConfirmBlock] = useState<{ kind: "client" | "pro" | "activity"; id: string; name: string } | null>(null);
  const [couponFor, setCouponFor] = useState<{ userId: string; email: string; name: string } | null>(null);
  const [reengageFor, setReengageFor] = useState<{ userId: string; email: string; name: string } | null>(null);
  const [reengageMsg, setReengageMsg] = useState("Novos horários disponíveis perto de você");
  const [reengageChannel, setReengageChannel] = useState<ReengagementLog["channel"]>("push");
  const [newAdmin, setNewAdmin] = useState<{ name: string; email: string; password: string; role: string; permissions: AdminPermission[] }>({
    name: "", email: "", password: "", role: "Suporte", permissions: [],
  });
  const setModStatus = (id: string, status: CustomModalityRequest["status"]) =>
    setCustomMods(customMods.map((m) => (m.id === id ? { ...m, status } : m)));
  const setTicketPriority = (id: string, priority: SupportTicketPriority) =>
    setTickets(tickets.map((t) => (t.id === id ? { ...t, priority } : t)));
  const closeTicket = (id: string) =>
    setTickets(tickets.map((t) => (t.id === id ? { ...t, status: "closed" } : t)));
  const sendReply = (id: string) => {
    const text = (reply[id] || "").trim();
    if (!text) return;
    setTickets(tickets.map((t) => t.id === id ? {
      ...t, messages: [...t.messages, { id: `m-${Date.now()}`, from: "admin", text, date: Date.now() }],
    } : t));
    setReply({ ...reply, [id]: "" });
  };
  const togglePerm = (p: AdminPermission) =>
    setNewAdmin((s) => ({ ...s, permissions: s.permissions.includes(p) ? s.permissions.filter((x) => x !== p) : [...s.permissions, p] }));
  const createAdmin = () => {
    if (!newAdmin.name.trim() || !newAdmin.email.trim() || !newAdmin.password.trim()) {
      toast.error("Preencha nome, email e senha"); return;
    }
    setAdmins([...admins, { id: `a-${Date.now()}`, ...newAdmin, createdAt: Date.now() }]);
    setNewAdmin({ name: "", email: "", password: "", role: "Suporte", permissions: [] });
    toast.success("Administrador criado");
  };
  const removeAdmin = (id: string) => setAdmins(admins.filter((a) => a.id !== id));

  const [activeUsers, setActiveUsers] = useState(0);
  const [bookingsCount, setBookingsCount] = useState(0);
  useEffect(() => {
    setActiveUsers(clients.filter((c) => !c.blocked).length);
    setBookingsCount(recurring.length);
  }, [clients, recurring]);

  const toggleClientBlock = (id: string) =>
    setClients(clients.map((c) => (c.id === id ? { ...c, blocked: !c.blocked } : c)));
  const toggleProBlock = (id: string) =>
    setPros(pros.map((p) => (p.id === id ? { ...p, blocked: !p.blocked } : p)));
  const setProStatus = (id: string, status: ProAccount["status"]) =>
    setPros(pros.map((p) => (p.id === id ? { ...p, status } : p)));

  const confirmBlockAction = () => {
    if (!confirmBlock) return;
    if (confirmBlock.kind === "client") toggleClientBlock(confirmBlock.id);
    else if (confirmBlock.kind === "pro") toggleProBlock(confirmBlock.id);
    else {
      // activity-only user: persist a blockedAccounts entry
      try {
        const raw = localStorage.getItem(KEYS.blockedAccounts);
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(confirmBlock.id)) {
          localStorage.setItem(KEYS.blockedAccounts, JSON.stringify([...list, confirmBlock.id]));
          window.dispatchEvent(new CustomEvent("mot-storage", { detail: { key: KEYS.blockedAccounts } }));
        }
      } catch { /* ignore */ }
    }
    toast.success(`Conta bloqueada: ${confirmBlock.name}`);
    setConfirmBlock(null);
  };

  const issueCoupon = (tplIdx: number) => {
    if (!couponFor) return;
    const tpl = ADMIN_COUPON_TEMPLATES[tplIdx];
    const code = `ADM-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const coupon: AdminCoupon = {
      id: `ac-${Date.now()}`, code, type: tpl.type, value: tpl.value, label: tpl.label,
      targetUserId: couponFor.userId, targetEmail: couponFor.email, createdAt: Date.now(),
    };
    setAdminCoupons([coupon, ...adminCoupons]);
    pushNotification({ audience: "client", title: "Cupom recebido", body: `${tpl.label} — código ${code}` });
    toast.success(`Cupom ${tpl.label} enviado para ${couponFor.email}`, { description: `Código: ${code}` });
    setCouponFor(null);
  };

  const sendReengage = () => {
    if (!reengageFor) return;
    const log: ReengagementLog = {
      id: `re-${Date.now()}`, userId: reengageFor.userId, email: reengageFor.email,
      channel: reengageChannel, message: reengageMsg, date: Date.now(),
    };
    setReengagement([log, ...reengagement]);
    pushNotification({ audience: "client", title: "Mensagem da plataforma", body: reengageMsg });
    toast.success(`Reengajamento enviado (${reengageChannel}) para ${reengageFor.email}`);
    setReengageFor(null);
  };

  const isBlockedAccount = (id: string) => {
    if (typeof window === "undefined") return false;
    try {
      const raw = localStorage.getItem(KEYS.blockedAccounts);
      const list: string[] = raw ? JSON.parse(raw) : [];
      return list.includes(id);
    } catch { return false; }
  };

  const tabs: { id: Tab; label: string; icon: typeof Users }[] = [
    { id: "overview", label: "Visão geral", icon: BarChart3 },
    { id: "users", label: "Usuários", icon: Users },
    { id: "validation", label: "Validação CREF", icon: ShieldCheck },
    { id: "bookings", label: "Reservas", icon: CalendarDays },
    { id: "payments", label: "Pagamentos", icon: DollarSign },
    { id: "reports", label: "Denúncias", icon: AlertTriangle },
    { id: "modalities", label: "Modalidades", icon: Tag },
    { id: "support", label: "Chamados", icon: LifeBuoy },
    { id: "admins", label: "Administradores", icon: UserCog },
    { id: "inactive", label: "Inativos", icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-background pb-10">
      <header className="border-b border-border bg-[var(--brand-black)] px-5 py-4 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--brand-yellow)]">Admin</p>
            <h1 className="text-lg font-bold">MyOwnTraining Console</h1>
          </div>
          <Link to="/" className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 pt-5">
        <div className="mb-5 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap ${
                tab === t.id ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white" : "border-border bg-card"
              }`}>
              <t.icon className="h-3.5 w-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="Usuários ativos" value={activeUsers || clients.length || 1} />
            <Metric label="Profissionais ativos" value={pros.filter((p) => p.status === "approved" && !p.blocked).length + TRAINERS.length} />
            <Metric label="Reservas recorrentes" value={bookingsCount} />
            <Metric label="Receita do mês" value={`R$ ${(refunds.reduce((s, r) => s + r.amount, 0) + (boost.active ? 50 : 0) + bookingsCount * 13.5).toFixed(2)}`} />
            <Metric label="Denúncias" value={reports.length} />
            <Metric label="Usuários bloqueados" value={blocked.length + clients.filter((c) => c.blocked).length} />
            <Metric label="Alertas emergência" value={alerts.length} />
            <Metric label="Reembolsos" value={refunds.length} />
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-6">
            <Section title={`Clientes (${clients.length})`}>
              {clients.length === 0 && <Empty text="Nenhum cliente cadastrado." />}
              {clients.map((c) => (
                <Row key={c.id}>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {c.name}
                      {c.blocked && <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">Conta bloqueada</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.email} · {c.city}/{c.state}</p>
                  </div>
                  <UserActions
                    onReengage={() => setReengageFor({ userId: c.id, email: c.email, name: c.name })}
                    onCoupon={() => setCouponFor({ userId: c.id, email: c.email, name: c.name })}
                    onBlock={() => setConfirmBlock({ kind: "client", id: c.id, name: c.name })}
                    blocked={!!c.blocked}
                  />
                </Row>
              ))}
            </Section>

            <Section title={`Profissionais (${pros.length})`}>
              {pros.length === 0 && <Empty text="Nenhum profissional cadastrado." />}
              {pros.map((p) => (
                <Row key={p.id}>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {p.name} <StatusBadge status={p.status} />
                      {p.blocked && <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">Conta bloqueada</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{p.email} · CREF {p.cref}</p>
                  </div>
                  <UserActions
                    onReengage={() => setReengageFor({ userId: p.id, email: p.email, name: p.name })}
                    onCoupon={() => setCouponFor({ userId: p.id, email: p.email, name: p.name })}
                    onBlock={() => setConfirmBlock({ kind: "pro", id: p.id, name: p.name })}
                    blocked={!!p.blocked}
                  />
                </Row>
              ))}
            </Section>
          </div>
        )}

        {tab === "validation" && (
          <Section title="Documentos CREF pendentes">
            {pros.filter((p) => p.status === "pending").length === 0 && <Empty text="Sem cadastros pendentes." />}
            {pros.filter((p) => p.status === "pending").map((p) => (
              <div key={p.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
                <div className="flex items-start gap-3">
                  {p.photo && <img src={p.photo} className="h-14 w-14 rounded-xl object-cover" alt="" />}
                  <div className="flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">CREF: {p.cref} · {p.education}</p>
                    <p className="mt-1 text-xs">{p.description}</p>
                    {p.crefDocUrl && (
                      <a href={p.crefDocUrl} target="_blank" rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-black)] underline">
                        <FileText className="h-3 w-3" /> Ver documento ({p.crefDocName})
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => setProStatus(p.id, "approved")} className="h-9 flex-1 rounded-lg bg-[var(--brand-yellow)] text-sm font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
                    <Check className="mr-1 h-3.5 w-3.5" /> Aprovar
                  </Button>
                  <Button onClick={() => setProStatus(p.id, "rejected")} variant="outline" className="h-9 flex-1 rounded-lg text-sm">
                    <X className="mr-1 h-3.5 w-3.5" /> Rejeitar
                  </Button>
                </div>
              </div>
            ))}
          </Section>
        )}

        {tab === "bookings" && (
          <Section title={`Reservas recorrentes (${recurring.length})`}>
            {recurring.length === 0 && <Empty text="Nenhuma reserva." />}
            {recurring.map((r) => (
              <Row key={r.id}>
                <div className="flex-1">
                  <p className="font-semibold">{r.clientName} → {r.trainerName}</p>
                  <p className="text-xs text-muted-foreground">{r.days.join(", ")} · {r.time} · R$ {r.value.toFixed(2)}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${r.active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {r.active ? "Ativa" : "Cancelada"}
                </span>
              </Row>
            ))}
          </Section>
        )}

        {tab === "payments" && (
          <div className="space-y-4">
            <Section title="Resumo financeiro">
              <Row><span className="flex-1 text-sm">Receita estimada</span><span className="font-semibold">R$ {(bookingsCount * 13.5).toFixed(2)}</span></Row>
              <Row><span className="flex-1 text-sm">Comissões (15%)</span><span className="font-semibold">R$ {(bookingsCount * 13.5).toFixed(2)}</span></Row>
              <Row><span className="flex-1 text-sm">Reembolsos</span><span className="font-semibold">R$ {refunds.reduce((s, r) => s + r.amount, 0).toFixed(2)}</span></Row>
              <Row><span className="flex-1 text-sm">Boost ativo</span><span className="font-semibold">{boost.active ? `Sim (${boost.plan})` : "Não"}</span></Row>
            </Section>
            <Section title="Reembolsos">
              {refunds.length === 0 && <Empty text="Sem reembolsos registrados." />}
              {refunds.map((r) => (
                <Row key={r.id}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">R$ {r.amount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{r.reason}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("pt-BR")}</span>
                </Row>
              ))}
            </Section>
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-4">
            <Section title={`Denúncias (${reports.length})`}>
              {reports.length === 0 && <Empty text="Sem denúncias." />}
              {reports.map((r) => (
                <Row key={r.id}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{r.reason}</p>
                    <p className="text-xs text-muted-foreground">Por {r.reporter} · Reserva {r.bookingId}</p>
                  </div>
                </Row>
              ))}
            </Section>
            <Section title={`Alertas de emergência (${alerts.length})`}>
              {alerts.length === 0 && <Empty text="Sem alertas." />}
              {alerts.map((a) => (
                <Row key={a.id}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{a.type}</p>
                    <p className="text-xs text-muted-foreground">Reserva {a.bookingId}</p>
                  </div>
                  <span className="text-xs">{new Date(a.date).toLocaleString("pt-BR")}</span>
                </Row>
              ))}
            </Section>
          </div>
        )}

        {tab === "modalities" && (
          <div className="space-y-6">
            <Section title={`Solicitações de modalidades (${customMods.filter((m) => m.status === "pending").length})`}>
              {customMods.filter((m) => m.status === "pending").length === 0 && <Empty text="Sem solicitações pendentes." />}
              {customMods.filter((m) => m.status === "pending").map((m) => (
                <Row key={m.id}>
                  <div className="flex-1">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">Por {m.trainerName} · {new Date(m.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <Button onClick={() => setModStatus(m.id, "approved")} className="h-8 rounded-lg bg-[var(--brand-yellow)] px-3 text-xs font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
                    <Check className="mr-1 h-3 w-3" /> Aprovar
                  </Button>
                  <Button onClick={() => setModStatus(m.id, "rejected")} variant="outline" className="h-8 rounded-lg px-3 text-xs">
                    <X className="mr-1 h-3 w-3" /> Rejeitar
                  </Button>
                </Row>
              ))}
            </Section>
            <Section title={`Modalidades aprovadas (${customMods.filter((m) => m.status === "approved").length})`}>
              {customMods.filter((m) => m.status === "approved").length === 0 && <Empty text="Sem aprovações ainda." />}
              {customMods.filter((m) => m.status === "approved").map((m) => (
                <Row key={m.id}>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">Sugerido por {m.trainerName}</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Ativa</span>
                </Row>
              ))}
            </Section>
          </div>
        )}

        {tab === "support" && (
          <Section title={`Chamados de suporte (${tickets.filter((t) => t.status === "open").length} abertos)`}>
            {tickets.length === 0 && <Empty text="Nenhum chamado." />}
            {tickets.map((t) => (
              <div key={t.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{t.type} · <span className="font-normal text-muted-foreground">{t.trainerName}</span></p>
                    <p className="mt-1 text-xs">{t.description}</p>
                    {t.bookingId && <p className="mt-0.5 text-[11px] text-muted-foreground">Booking: {t.bookingId}</p>}
                    {t.imageDataUrl && <img src={t.imageDataUrl} alt="" className="mt-2 max-h-32 rounded-lg" />}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.status === "open" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-700"}`}>
                      {t.status === "open" ? "Aberto" : "Fechado"}
                    </span>
                    <select value={t.priority} onChange={(e) => setTicketPriority(t.id, e.target.value as SupportTicketPriority)}
                      className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px]">
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>
                {t.messages.length > 0 && (
                  <div className="mt-2 space-y-1 rounded-lg bg-muted/40 p-2">
                    {t.messages.map((m) => (
                      <p key={m.id} className="text-[11px]"><span className="font-semibold">{m.from === "admin" ? "Admin" : t.trainerName}:</span> {m.text}</p>
                    ))}
                  </div>
                )}
                {t.status === "open" && (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={reply[t.id] || ""}
                      onChange={(e) => setReply({ ...reply, [t.id]: e.target.value })}
                      placeholder="Responder..."
                      className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-xs"
                    />
                    <Button onClick={() => sendReply(t.id)} className="h-9 rounded-lg bg-[var(--brand-yellow)] px-3 text-xs font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
                      Enviar
                    </Button>
                    <Button onClick={() => closeTicket(t.id)} variant="outline" className="h-9 rounded-lg px-3 text-xs">
                      Fechar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </Section>
        )}

        {tab === "admins" && (
          <div className="space-y-6">
            <Section title="Criar novo administrador">
              <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)] space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Nome" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} className="h-10 rounded-lg" />
                  <Input placeholder="Email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} className="h-10 rounded-lg" />
                  <Input placeholder="Senha" type="password" value={newAdmin.password} onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })} className="h-10 rounded-lg" />
                  <Input placeholder="Cargo" value={newAdmin.role} onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })} className="h-10 rounded-lg" />
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">Permissões</p>
                  <div className="flex flex-wrap gap-2">
                    {ADMIN_PERMISSIONS.map((p) => {
                      const active = newAdmin.permissions.includes(p.id);
                      return (
                        <button key={p.id} type="button" onClick={() => togglePerm(p.id)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${active ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white" : "border-border bg-card"}`}>
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Button onClick={createAdmin} className="h-10 w-full rounded-lg bg-[var(--brand-yellow)] text-sm font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
                  Criar administrador
                </Button>
              </div>
            </Section>
            <Section title={`Administradores ativos (${admins.length})`}>
              {admins.length === 0 && <Empty text="Nenhum administrador adicional." />}
              {admins.map((a) => (
                <Row key={a.id}>
                  <div className="flex-1">
                    <p className="font-semibold">{a.name} <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px]">{a.role}</span></p>
                    <p className="text-xs text-muted-foreground">{a.email} · {a.permissions.length ? a.permissions.join(", ") : "sem permissões"}</p>
                  </div>
                  <button onClick={() => removeAdmin(a.id)} className="flex items-center gap-1 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white">
                    <Trash2 className="h-3 w-3" /> Remover
                  </button>
                </Row>
              ))}
            </Section>
          </div>
        )}

        {tab === "inactive" && (
          <Section title={`Usuários inativos (>30 dias) — ${activity.filter((u) => Date.now() - u.lastLogin > 30 * 86400000).length}`}>
            {activity.filter((u) => Date.now() - u.lastLogin > 30 * 86400000).length === 0 && <Empty text="Nenhum usuário inativo." />}
            {activity.filter((u) => Date.now() - u.lastLogin > 30 * 86400000).map((u) => {
              const days = Math.floor((Date.now() - u.lastLogin) / 86400000);
              const blocked = isBlockedAccount(u.userId);
              return (
                <Row key={u.userId}>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {u.name} <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase">{u.accountType}</span>
                      {blocked && <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">Conta bloqueada</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{u.email} · {u.totalBookings} reservas · último acesso há {days} dias</p>
                  </div>
                  <UserActions
                    onReengage={() => setReengageFor({ userId: u.userId, email: u.email, name: u.name })}
                    onCoupon={() => setCouponFor({ userId: u.userId, email: u.email, name: u.name })}
                    onBlock={() => setConfirmBlock({ kind: "activity", id: u.userId, name: u.name })}
                    blocked={blocked}
                  />
                </Row>
              );
            })}
          </Section>
        )}
      </div>

      {confirmBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmBlock(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-background p-5">
            <h2 className="mb-2 text-lg font-bold">Bloquear usuário</h2>
            <p className="mb-4 text-sm text-muted-foreground">Tem certeza que deseja bloquear <span className="font-semibold text-foreground">{confirmBlock.name}</span>? A conta será suspensa, login bloqueado e reservas/carteira desativadas.</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setConfirmBlock(null)} className="h-11 flex-1 rounded-xl">Cancelar</Button>
              <Button onClick={confirmBlockAction} className="h-11 flex-1 rounded-xl bg-destructive text-white hover:bg-destructive/90">Bloquear</Button>
            </div>
          </div>
        </div>
      )}

      {couponFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setCouponFor(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-background p-5">
            <h2 className="mb-1 text-lg font-bold">Gerar cupom</h2>
            <p className="mb-3 text-xs text-muted-foreground">Para {couponFor.name} ({couponFor.email})</p>
            <div className="space-y-2">
              {ADMIN_COUPON_TEMPLATES.map((tpl, i) => (
                <button key={tpl.label} onClick={() => issueCoupon(i)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium hover:bg-muted">
                  <span className="flex items-center gap-2"><Gift className="h-4 w-4" /> {tpl.label}</span>
                  <span className="text-xs text-muted-foreground">enviar</span>
                </button>
              ))}
            </div>
            <Button variant="outline" onClick={() => setCouponFor(null)} className="mt-4 h-10 w-full rounded-xl">Cancelar</Button>
          </div>
        </div>
      )}

      {reengageFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setReengageFor(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-background p-5">
            <h2 className="mb-1 text-lg font-bold">Reengajar usuário</h2>
            <p className="mb-3 text-xs text-muted-foreground">Para {reengageFor.name} ({reengageFor.email})</p>
            <p className="mb-1 text-xs font-semibold text-muted-foreground">Canal</p>
            <div className="mb-3 grid grid-cols-3 gap-2">
              {(["push", "email", "alert"] as const).map((c) => (
                <button key={c} onClick={() => setReengageChannel(c)}
                  className={`rounded-lg border py-2 text-xs font-medium ${reengageChannel === c ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white" : "border-border bg-card"}`}>
                  {c === "push" ? "Push" : c === "email" ? "Email" : "Alerta"}
                </button>
              ))}
            </div>
            <p className="mb-1 text-xs font-semibold text-muted-foreground">Mensagem</p>
            <select onChange={(e) => setReengageMsg(e.target.value)} className="mb-2 h-9 w-full rounded-lg border border-border bg-background px-2 text-xs">
              <option>Novos horários disponíveis perto de você</option>
              <option>Volte e ganhe desconto no próximo treino</option>
              <option>Profissionais premium chegaram na sua região</option>
            </select>
            <Input value={reengageMsg} onChange={(e) => setReengageMsg(e.target.value)} className="h-10 rounded-lg" />
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setReengageFor(null)} className="h-11 flex-1 rounded-xl">Cancelar</Button>
              <Button onClick={sendReengage} className="h-11 flex-1 rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
                <Send className="mr-1 h-4 w-4" /> Enviar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UserActions({ onReengage, onCoupon, onBlock, blocked }: {
  onReengage: () => void; onCoupon: () => void; onBlock: () => void; blocked?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <button onClick={onReengage} className="flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-[11px] font-semibold">
        <Send className="h-3 w-3" /> Reengajar
      </button>
      <button onClick={onCoupon} className="flex items-center gap-1 rounded-lg bg-[var(--brand-yellow)] px-2.5 py-1.5 text-[11px] font-semibold text-[var(--brand-black)]">
        <Gift className="h-3 w-3" /> Cupom
      </button>
      <button onClick={onBlock} className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${blocked ? "bg-muted text-foreground" : "bg-destructive text-white"}`}>
        <Ban className="h-3 w-3" /> {blocked ? "Desbloquear" : "Bloquear"}
      </button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold text-muted-foreground">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-[var(--shadow-soft)]">{children}</div>;
}
function Empty({ text }: { text: string }) {
  return <p className="rounded-xl bg-card p-4 text-sm text-muted-foreground">{text}</p>;
}
function StatusBadge({ status }: { status: ProAccount["status"] }) {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  const label = { pending: "Pendente", approved: "Aprovado", rejected: "Rejeitado" };
  return <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${map[status]}`}>{label[status]}</span>;
}
