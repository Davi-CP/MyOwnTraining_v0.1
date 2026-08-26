import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, LifeBuoy, Paperclip } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useStored, KEYS, pushNotification, DEFAULT_PERSONAL,
  type ClientSupportTicket, type ClientSupportTicketType, type Personal,
} from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/client/support")({
  component: SupportPage,
  head: () => ({ meta: [{ title: "Suporte — MyOwnTraining" }] }),
});

const TYPES: ClientSupportTicketType[] = [
  "Pagamento", "Profissional", "Agendamento", "Reembolso",
  "Comportamento inadequado", "Segurança", "Outro",
];

function SupportPage() {
  const [personal] = useStored<Personal>(KEYS.personal, DEFAULT_PERSONAL);
  const [tickets, setTickets] = useStored<ClientSupportTicket[]>(KEYS.clientSupportTickets, []);
  const [type, setType] = useState<ClientSupportTicketType>("Pagamento");
  const [description, setDescription] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [image, setImage] = useState<string | undefined>();

  const clientId = personal.email || "me";
  const myTickets = tickets.filter((t) => t.clientId === clientId);

  const onImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => setImage(r.result as string);
    r.readAsDataURL(f);
  };

  const submit = () => {
    if (description.trim().length < 5) { toast.error("Descreva o problema (mín. 5 caracteres)"); return; }
    const ticket: ClientSupportTicket = {
      id: `ctk-${Date.now()}`,
      clientId, clientName: personal.name,
      type, description: description.trim(),
      bookingId: bookingId.trim() || undefined,
      imageDataUrl: image,
      status: "open", priority: "medium", messages: [], createdAt: Date.now(),
    };
    setTickets([ticket, ...tickets]);
    pushNotification({ audience: "client", title: "Chamado enviado", body: "Nossa equipe responderá em breve." });
    toast.success("Chamado enviado ao suporte");
    setDescription(""); setBookingId(""); setImage(undefined);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="flex-1 text-xl font-bold">Suporte</h1>
          <LifeBuoy className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="space-y-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo do problema</span>
            <select value={type} onChange={(e) => setType(e.target.value as ClientSupportTicketType)}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Descrição</span>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Descreva o que aconteceu..." />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Booking relacionado (opcional)</span>
            <Input value={bookingId} onChange={(e) => setBookingId(e.target.value)} placeholder="Ex: s1, s2..." className="h-11 rounded-xl" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Imagem (opcional)</span>
            <div className="flex items-center gap-2">
              <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-3 text-xs text-muted-foreground">
                <Paperclip className="h-4 w-4" /> Anexar
                <input type="file" accept="image/*" onChange={onImage} className="hidden" />
              </label>
              {image && <img src={image} alt="" className="h-11 w-11 rounded-lg object-cover" />}
            </div>
          </label>
          <Button onClick={submit} className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
            Enviar chamado
          </Button>
        </div>

        <h2 className="mt-6 mb-2 text-sm font-semibold">Meus chamados</h2>
        {myTickets.length === 0 && (
          <p className="rounded-2xl bg-card p-4 text-center text-xs text-muted-foreground shadow-[var(--shadow-soft)]">Nenhum chamado aberto.</p>
        )}
        <div className="space-y-2">
          {myTickets.map((t) => (
            <div key={t.id} className="rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{t.type}</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.status === "open" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-700"}`}>
                  {t.status === "open" ? "Aberto" : "Fechado"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>
              {t.messages.length > 0 && (
                <div className="mt-2 space-y-1 rounded-lg bg-muted/40 p-2">
                  {t.messages.map((m) => (
                    <p key={m.id} className="text-[11px]">
                      <span className="font-semibold">{m.from === "admin" ? "Admin" : "Você"}:</span> {m.text}
                    </p>
                  ))}
                </div>
              )}
              <p className="mt-1 text-[10px] text-muted-foreground">{new Date(t.createdAt).toLocaleString("pt-BR")}</p>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
