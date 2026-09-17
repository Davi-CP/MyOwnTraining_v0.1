import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CreditCard, Banknote, QrCode, Check, Wallet } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  useStored, KEYS, DEFAULT_SESSIONS, DEFAULT_CLIENT_LOYALTY,
  pushNotification, type Session, type ClientLoyalty,
} from "@/lib/storage";

export const Route = createFileRoute("/payment")({
  component: PaymentPage,
  validateSearch: (s: Record<string, unknown>) => ({ id: (s.id as string) ?? "" }),
  head: () => ({ meta: [{ title: "Pagamento — MyOwnTraining" }] }),
});

const methods = [
  { id: "pix", label: "Pix", desc: "Aprovação instantânea", icon: QrCode },
  { id: "credit", label: "Cartão de crédito", desc: "Visa, Master, Elo", icon: CreditCard },
  { id: "debit", label: "Cartão de débito", desc: "Débito à vista", icon: Wallet },
  { id: "cash", label: "Dinheiro", desc: "Pagar diretamente ao profissional", icon: Banknote },
] as const;

function PaymentPage() {
  const { id } = Route.useSearch();
  const nav = useNavigate();
  const [method, setMethod] = useState<string>("pix");
  const [done, setDone] = useState(false);
  const [card, setCard] = useState({ number: "", exp: "", cvv: "", name: "" });
  const [sessions, setSessions] = useStored<Session[]>(KEYS.sessions, DEFAULT_SESSIONS);
  const [loyalty, setLoyalty] = useStored<ClientLoyalty>(KEYS.clientLoyalty, DEFAULT_CLIENT_LOYALTY);

  const confirm = () => {
    try {
      const raw = sessionStorage.getItem("mot:pendingBooking");
      if (raw) {
        const p = JSON.parse(raw);
        const newSession: Session = {
          id: `s-${Date.now()}`,
          trainerId: p.trainerId ?? id,
          date: p.date ?? "Hoje",
          time: p.time ?? "07:00",
          duration: p.duration ?? 60,
          place: p.place ?? "",
          value: p.value ?? p.total ?? 0,
          status: "upcoming",
          quantity: p.quantity ?? 1,
        };
        setSessions([newSession, ...sessions]);
        sessionStorage.removeItem("mot:pendingBooking");

      }
    } catch { /* ignore */ }
    if (loyalty.pendingDiscount) setLoyalty({ ...loyalty, pendingDiscount: false });
    pushNotification({ audience: "client", title: "Treino confirmado", body: "Seu agendamento foi aceito." });
    pushNotification({ audience: "trainer", title: "Novo pedido de treino", body: "Você recebeu uma nova solicitação." });
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-yellow)]">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-bold">Treino agendado!</h1>
          <p className="mt-2 text-sm text-muted-foreground">Seu personal foi notificado. Boa sessão!</p>
          <Button onClick={() => nav({ to: "/bookings" })}
            className="mt-8 h-12 rounded-xl bg-[var(--brand-yellow)] px-8 text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
            Ver meus treinos
          </Button>
        </div>
      </div>
    );
  }

  const showCard = method === "credit" || method === "debit";
  const cardValid = !showCard || (
    card.number.replace(/\s/g, "").length >= 13 && card.exp.length >= 5 && card.cvv.length >= 3 && card.name.trim().length >= 3
  );

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/parq" search={{ id }} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Pagamento</h1>
        </div>

        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Escolha o método</h2>
        <div className="space-y-2">
          {methods.map((m) => (
            <button key={m.id} onClick={() => setMethod(m.id)}
              className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${
                method === m.id ? "border-[var(--brand-black)] bg-card" : "border-border bg-card"
              }`}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-yellow)]/30">
                <m.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </div>
              <div className={`h-5 w-5 rounded-full border-2 ${
                method === m.id ? "border-[var(--brand-black)] bg-[var(--brand-black)]" : "border-border"
              }`} />
            </button>
          ))}
        </div>

        {showCard && (
          <div className="mt-4 space-y-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Número do cartão</span>
              <input
                inputMode="numeric" maxLength={19}
                value={card.number}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                  const grouped = digits.replace(/(.{4})/g, "$1 ").trim();
                  setCard({ ...card, number: grouped });
                }}
                placeholder="0000 0000 0000 0000"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-[var(--brand-yellow)]"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Validade</span>
                <input
                  inputMode="numeric" maxLength={5}
                  value={card.exp}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                    const formatted = digits.length > 2 ? `${digits.slice(0,2)}/${digits.slice(2)}` : digits;
                    setCard({ ...card, exp: formatted });
                  }}
                  placeholder="MM/AA"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-[var(--brand-yellow)]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">CVV</span>
                <input
                  inputMode="numeric" maxLength={4}
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                  placeholder="123"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-[var(--brand-yellow)]"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nome impresso no cartão</span>
              <input
                value={card.name}
                onChange={(e) => setCard({ ...card, name: e.target.value.toUpperCase() })}
                placeholder="NOME COMO NO CARTÃO"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm uppercase outline-none focus:border-[var(--brand-yellow)]"
              />
            </label>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Pagamentos processados via Stripe Connect. Taxa da plataforma: 15%. Profissional recebe 85% automaticamente.
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md px-5 py-3">
          <Button disabled={!cardValid} onClick={confirm}
            className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90 disabled:opacity-40">
            Confirmar pagamento
          </Button>
        </div>
      </div>
    </div>
  );
}
