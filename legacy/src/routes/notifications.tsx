import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bell } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { useStored, KEYS, type AppNotification } from "@/lib/storage";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notificações — MyOwnTraining" }] }),
});

function NotificationsPage() {
  const [items, setItems] = useStored<AppNotification[]>(KEYS.notifications, []);
  const client = items.filter((n) => n.audience === "client");

  const markAllRead = () => setItems(items.map((n) => ({ ...n, read: true })));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="flex-1 text-xl font-bold">Notificações</h1>
          {client.length > 0 && (
            <button onClick={markAllRead} className="text-xs font-medium text-muted-foreground">Marcar lidas</button>
          )}
        </div>

        {client.length === 0 && (
          <div className="mt-12 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
            Nenhuma notificação ainda.
          </div>
        )}

        <div className="space-y-2">
          {client.map((n) => (
            <div key={n.id} className={`rounded-2xl p-4 shadow-[var(--shadow-soft)] ${n.read ? "bg-card" : "bg-[var(--brand-yellow)]/20"}`}>
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.body}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{new Date(n.date).toLocaleString("pt-BR")}</p>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
