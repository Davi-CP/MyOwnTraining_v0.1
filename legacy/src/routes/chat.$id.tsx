import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Send, Shield, Flag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TRAINERS } from "@/lib/mock-data";
import {
  useStored, KEYS, type ChatMessage,
  type BlockedUser, type SafetyReport,
} from "@/lib/storage";

export const Route = createFileRoute("/chat/$id")({
  component: ChatPage,
  loader: ({ params }) => {
    const trainer = TRAINERS.find((t) => t.id === params.id);
    if (!trainer) throw notFound();
    return { trainer };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Chat com ${loaderData?.trainer.name ?? "profissional"} — MyOwnTraining` }],
  }),
});

function ChatPage() {
  const { trainer } = Route.useLoaderData() as { trainer: typeof TRAINERS[number] };
  const nav = useNavigate();
  const [allChats, setChats] = useStored<Record<string, ChatMessage[]>>(KEYS.chats, {});
  const [blocked, setBlocked] = useStored<BlockedUser[]>(KEYS.blockedUsers, []);
  const [, setReports] = useStored<SafetyReport[]>(KEYS.safetyReports, []);
  const isBlocked = blocked.some((b) => b.targetId === trainer.id);
  const messages = allChats[trainer.id] ?? [
    { id: "m0", from: "them", text: `Olá! Aqui é ${trainer.name.split(" ")[0]}, em que posso ajudar?`, ts: Date.now() - 60000 },
  ];
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const blockUser = () => {
    setBlocked([{ id: `b-${Date.now()}`, blockedBy: "client", targetId: trainer.id, date: Date.now() }, ...blocked]);
    toast.success(`${trainer.name} bloqueado`);
    setMenuOpen(false);
    nav({ to: "/bookings" });
  };
  const reportUser = () => {
    setReports((prev) => [
      { id: `r-${Date.now()}`, bookingId: "", reporter: "client", targetId: trainer.id, reason: "Comportamento no chat", date: Date.now() },
      ...prev,
    ]);
    toast.success("Reporte enviado");
    setMenuOpen(false);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) { toast.error("Usuário bloqueado"); return; }
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = Date.now();
    const mine: ChatMessage = { id: `m-${now}`, from: "me", text: trimmed, ts: now };
    const reply: ChatMessage = {
      id: `m-${now + 1}`, from: "them",
      text: "Beleza! Já anotei. Te confirmo o horário em instantes.", ts: now + 1500,
    };
    setChats((prev) => ({ ...prev, [trainer.id]: [...(prev[trainer.id] ?? messages), mine, reply] }));
    setText("");
  };

  const fmt = (ts: number) =>
    new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
          <Link to="/trainer/$id" params={{ id: trainer.id }} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <img src={trainer.photo} alt="" className="h-10 w-10 rounded-full bg-muted" />
          <div className="flex-1">
            <p className="text-sm font-semibold">{trainer.name}</p>
            <p className="text-[11px] text-green-600">{isBlocked ? "bloqueado" : "online agora"}</p>
          </div>
          <div className="relative">
            <button onClick={() => setMenuOpen((o) => !o)} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <Shield className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
                <button onClick={reportUser} className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs hover:bg-muted">
                  <Flag className="h-3.5 w-3.5" /> Reportar usuário
                </button>
                {!isBlocked && (
                  <button onClick={blockUser} className="flex w-full items-center gap-2 border-t border-border px-3 py-2.5 text-left text-xs text-destructive hover:bg-muted">
                    <Shield className="h-3.5 w-3.5" /> Bloquear usuário
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-2 px-4 py-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-[var(--shadow-soft)] ${
              m.from === "me" ? "bg-[var(--brand-yellow)] text-[var(--brand-black)]" : "bg-card"
            }`}>
              <p className="leading-snug">{m.text}</p>
              <p className={`mt-1 text-[10px] ${m.from === "me" ? "text-[var(--brand-black)]/60" : "text-muted-foreground"}`}>{fmt(m.ts)}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="sticky bottom-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva uma mensagem"
            className="h-11 flex-1 rounded-full border border-border bg-card px-4 text-sm outline-none focus:border-[var(--brand-yellow)]" />
          <button type="submit" className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-yellow)]">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
