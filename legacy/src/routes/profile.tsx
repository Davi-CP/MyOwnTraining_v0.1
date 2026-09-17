import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, User, CreditCard, Tag, Shield, HelpCircle, LogOut, Clock, Bell, Repeat } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useStored, KEYS, DEFAULT_PERSONAL, type Personal, type AppNotification, type Session, DEFAULT_SESSIONS } from "@/lib/storage";

export const Route = createFileRoute("/profile")({
  component: Profile,
  head: () => ({ meta: [{ title: "Meu perfil — MyOwnTraining" }] }),
});

const sections: { icon: typeof User; label: string; to: string }[] = [
  { icon: User, label: "Dados pessoais", to: "/profile/personal" },
  { icon: Clock, label: "Histórico de treinos", to: "/profile/history" },
  { icon: Repeat, label: "Treinos recorrentes", to: "/profile/recurring" },
  { icon: Tag, label: "Cupons", to: "/profile/coupons" },
  { icon: CreditCard, label: "Pagamentos", to: "/profile/payments" },
  { icon: Bell, label: "Notificações", to: "/notifications" },
  { icon: Shield, label: "Segurança e privacidade", to: "/client/security" },
  { icon: HelpCircle, label: "Suporte", to: "/client/support" },
  { icon: HelpCircle, label: "Ajuda", to: "/client/help" },
];

function Profile() {
  const [personal] = useStored<Personal>(KEYS.personal, DEFAULT_PERSONAL);
  const [notifs] = useStored<AppNotification[]>(KEYS.notifications, []);
  const [sessions] = useStored<Session[]>(KEYS.sessions, DEFAULT_SESSIONS);
  const unread = notifs.filter((n) => n.audience === "client" && !n.read).length;
  const completed = sessions.filter((s) => s.status === "completed").length;
  
  const initial = personal.name.trim().charAt(0).toUpperCase() || "M";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[var(--brand-yellow)] flex items-center justify-center text-xl font-bold">{initial}</div>
          <div>
            <h1 className="text-xl font-bold">{personal.name}</h1>
            <p className="text-sm text-muted-foreground">{personal.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
          {[
            { v: String(sessions.length), l: "Treinos" },
            { v: String(completed), l: "Concluídos" },
            { v: "4.9", l: "Sua nota" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-xl font-bold">{s.v}</p>
              <p className="text-xs text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-soft)]">
          {sections.map((s, i) => (
            <Link key={s.label} to={s.to as "/profile/personal"}
              className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm hover:bg-muted/40 ${
                i > 0 ? "border-t border-border" : ""
              }`}>
              <s.icon className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{s.label}</span>
              {s.label === "Notificações" && unread > 0 && (
                <span className="rounded-full bg-[var(--brand-yellow)] px-1.5 text-[10px] font-bold">{unread}</span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <Link to="/" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-card px-4 py-3.5 text-sm font-medium text-destructive shadow-[var(--shadow-soft)]">
          <LogOut className="h-4 w-4" /> Sair
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
