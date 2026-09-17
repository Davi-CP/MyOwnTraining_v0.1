import { createFileRoute, Link } from "@tanstack/react-router";
import { ProBottomNav } from "@/components/ProBottomNav";
import { useStored, KEYS, STUDENTS, type ChatMessage } from "@/lib/storage";

export const Route = createFileRoute("/pro/chats")({
  component: ProChats,
  head: () => ({ meta: [{ title: "Chats — MyOwnTraining" }] }),
});

const FALLBACK_PREVIEWS: Record<string, { text: string; ts: number; unread: number }> = {
  u1: { text: "Obrigada pelo treino de hoje!", ts: Date.now() - 1000 * 60 * 30, unread: 2 },
  u2: { text: "Posso remarcar para amanhã?", ts: Date.now() - 1000 * 60 * 60 * 3, unread: 1 },
  u3: { text: "Combinado, até quarta.", ts: Date.now() - 1000 * 60 * 60 * 26, unread: 0 },
};

function fmt(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

function ProChats() {
  const [allChats] = useStored<Record<string, ChatMessage[]>>(KEYS.proChats, {});

  const items = STUDENTS.map((s) => {
    const msgs = allChats[s.id];
    const last = msgs && msgs.length ? msgs[msgs.length - 1] : null;
    const fb = FALLBACK_PREVIEWS[s.id];
    return {
      student: s,
      text: last?.text ?? fb?.text ?? "Inicie uma conversa",
      ts: last?.ts ?? fb?.ts ?? 0,
      unread: fb?.unread ?? 0,
    };
  }).filter((it) => it.ts > 0).sort((a, b) => b.ts - a.ts);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <h1 className="mb-4 text-xl font-bold">Chats</h1>

        {items.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">Nenhuma conversa ainda.</p>
        )}

        <div className="space-y-2">
          {items.map((it) => (
            <Link
              key={it.student.id}
              to="/pro/chat/$id"
              params={{ id: it.student.id }}
              className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]"
            >
              <img src={it.student.photo} alt="" className="h-12 w-12 rounded-full bg-muted" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{it.student.name}</p>
                  <span className="text-[10px] text-muted-foreground">{fmt(it.ts)}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">{it.text}</p>
              </div>
              {it.unread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand-yellow)] px-1.5 text-[10px] font-bold text-[var(--brand-black)]">
                  {it.unread}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
      <ProBottomNav />
    </div>
  );
}
