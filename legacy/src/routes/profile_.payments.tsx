import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CreditCard, Smartphone, Trash2, Plus, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStored, KEYS, type PaymentMethod } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/profile_/payments")({
  component: Payments,
  head: () => ({ meta: [{ title: "Pagamentos — MyOwnTraining" }] }),
});

function Payments() {
  const [methods, setMethods] = useStored<PaymentMethod[]>(KEYS.paymentMethods, []);
  const [adding, setAdding] = useState<"credit" | "debit" | null>(null);
  const [form, setForm] = useState({ name: "", number: "", exp: "", cvv: "" });

  const save = () => {
    if (!form.name || !form.number || !form.exp || !form.cvv) {
      toast.error("Preencha todos os campos do cartão.");
      return;
    }
    const last4 = form.number.replace(/\s/g, "").slice(-4);
    const id = `pm-${Date.now()}`;
    setMethods((prev) => [
      ...prev,
      { id, type: adding!, name: form.name, last4, exp: form.exp },
    ]);
    toast.success(`Cartão de ${adding === "credit" ? "crédito" : "débito"} salvo`);
    setForm({ name: "", number: "", exp: "", cvv: "" });
    setAdding(null);
  };

  const remove = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
    toast.success("Forma de pagamento removida");
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Pagamentos</h1>
        </div>

        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Formas salvas</h2>
        <div className="space-y-2">
          {methods.length === 0 && (
            <p className="rounded-2xl bg-card p-4 text-center text-xs text-muted-foreground shadow-[var(--shadow-soft)]">
              Nenhuma forma de pagamento salva.
            </p>
          )}
          {methods.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-yellow)]">
                {m.type === "pix" ? <Smartphone className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-semibold">
                  {m.type === "pix" ? "PIX" : m.type === "credit" ? "Crédito" : "Débito"}
                  {m.last4 && ` •••• ${m.last4}`}
                </p>
                <p className="text-xs text-muted-foreground">{m.name || "Chave PIX cadastrada"}</p>
              </div>
              <button onClick={() => remove(m.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <h2 className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Adicionar pagamento</h2>
        <div className="grid grid-cols-3 gap-2">
          {([
            { k: "credit", label: "Crédito", Icon: CreditCard },
            { k: "debit", label: "Débito", Icon: CreditCard },
            { k: "pix", label: "PIX", Icon: Smartphone },
          ] as const).map(({ k, label, Icon }) => (
            <button
              key={k}
              onClick={() => {
                if (k === "pix") {
                  setMethods((prev) => [...prev, { id: `pm-${Date.now()}`, type: "pix", name: "", last4: "", exp: "" }]);
                  toast.success("PIX habilitado como forma de pagamento");
                } else {
                  setAdding(k);
                }
              }}
              className={`flex flex-col items-center gap-1 rounded-2xl border bg-card p-3 text-xs font-medium shadow-[var(--shadow-soft)] transition-colors ${
                adding === k ? "border-[var(--brand-yellow)]" : "border-border"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>

        {(adding === "credit" || adding === "debit") && (
          <div className="mt-4 space-y-3 rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
            <p className="text-sm font-semibold">
              Novo cartão de {adding === "credit" ? "crédito" : "débito"}
            </p>
            <Field label="Nome no cartão" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Como impresso" />
            <Field label="Número do cartão" value={form.number} onChange={(v) => setForm({ ...form, number: v })} placeholder="0000 0000 0000 0000" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Validade" value={form.exp} onChange={(v) => setForm({ ...form, exp: v })} placeholder="MM/AA" />
              <Field label="CVV" value={form.cvv} onChange={(v) => setForm({ ...form, cvv: v })} placeholder="123" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setAdding(null)} variant="outline" className="h-11 flex-1 rounded-xl">
                Cancelar
              </Button>
              <Button onClick={save} className="h-11 flex-1 rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
                <Check className="mr-1 h-4 w-4" /> Salvar cartão
              </Button>
            </div>
          </div>
        )}

        {!adding && methods.length === 0 && (
          <p className="mt-4 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
            <Plus className="h-3 w-3" /> Selecione uma forma de pagamento acima
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-[var(--brand-yellow)]"
      />
    </label>
  );
}
