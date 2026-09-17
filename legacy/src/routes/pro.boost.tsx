import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Crown, Sparkles, Zap, ArrowLeft } from "lucide-react";
import { ProBottomNav } from "@/components/ProBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStored, KEYS, DEFAULT_PRO_BOOST, type ProBoost, type BoostPlan } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/boost")({
  component: BoostPage,
  head: () => ({ meta: [{ title: "Impulsionar perfil — MyOwnTraining" }] }),
});

type Plan = {
  id: BoostPlan;
  name: string;
  price: number;
  days: number;
  icon: typeof Zap;
  highlight?: string;
  benefits: string[];
};

const PLANS: Plan[] = [
  {
    id: "daily",
    name: "Destaque Diário",
    price: 10,
    days: 1,
    icon: Zap,
    benefits: [
      "Aparecer primeiro no mapa",
      "Aparecer primeiro na lista de profissionais",
      'Selo visual "Patrocinado"',
      "Prioridade por 24 horas",
    ],
  },
  {
    id: "weekly",
    name: "Destaque Semanal",
    price: 50,
    days: 7,
    icon: Sparkles,
    highlight: "Mais escolhido",
    benefits: ["Prioridade por 7 dias", "Economia vs plano diário", 'Selo "Patrocinado"'],
  },
  {
    id: "monthly",
    name: "Destaque Mensal",
    price: 150,
    days: 30,
    icon: Crown,
    highlight: "Melhor custo-benefício",
    benefits: ["Prioridade por 30 dias", "Maior exposição", "Economia máxima"],
  },
];

type PayMethod = "pix" | "credit" | "debit";

function BoostPage() {
  const navigate = useNavigate();
  const [boost, setBoost] = useStored<ProBoost>(KEYS.proBoost, DEFAULT_PRO_BOOST);
  const [selected, setSelected] = useState<BoostPlan>("weekly");
  const [method, setMethod] = useState<PayMethod>("pix");
  const [card, setCard] = useState({ name: "", number: "", exp: "", cvv: "" });

  const plan = PLANS.find((p) => p.id === selected)!;

  const pay = () => {
    if (method !== "pix") {
      if (!card.name || !card.number || !card.exp || !card.cvv) {
        toast.error("Preencha os dados do cartão");
        return;
      }
    }
    const start = new Date();
    const end = new Date(start.getTime() + plan.days * 24 * 60 * 60 * 1000);
    setBoost({
      active: true,
      plan: plan.id,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
    toast.success("Boost ativado!", { description: `${plan.name} válido até ${end.toLocaleDateString("pt-BR")}` });
    navigate({ to: "/pro/dashboard" });
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-md px-5 pt-6">
        <button onClick={() => navigate({ to: "/pro/dashboard" })} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </button>

        <h1 className="text-2xl font-bold">Impulsione seu perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Apareça primeiro nas buscas da sua região e aumente suas chances de receber novos alunos.
        </p>

        {boost.active && boost.endDate && (
          <div className="mt-4 rounded-2xl bg-[var(--brand-yellow)]/20 border border-[var(--brand-yellow)] p-3 text-sm">
            ✨ Boost ativo até {new Date(boost.endDate).toLocaleDateString("pt-BR")}
          </div>
        )}

        <section className="mt-6 space-y-3">
          {PLANS.map((p) => {
            const Icon = p.icon;
            const isSel = selected === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                  isSel ? "border-[var(--brand-yellow)] bg-[var(--brand-yellow)]/10" : "border-border bg-card"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <p className="font-semibold">{p.name}</p>
                  </div>
                  <p className="text-lg font-bold">R$ {p.price.toFixed(2).replace(".", ",")}</p>
                </div>
                {p.highlight && (
                  <span className="mt-1 inline-block rounded-full bg-[var(--brand-black)] px-2 py-0.5 text-[10px] font-semibold text-[var(--brand-yellow)]">
                    {p.highlight}
                  </span>
                )}
                <ul className="mt-3 space-y-1.5">
                  {p.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--brand-yellow)]" /> {b}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </section>

        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Forma de pagamento</h2>
          <div className="grid grid-cols-3 gap-2">
            {(["pix", "credit", "debit"] as PayMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`rounded-xl border py-3 text-sm font-medium ${
                  method === m ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white" : "border-border bg-card"
                }`}
              >
                {m === "pix" ? "PIX" : m === "credit" ? "Crédito" : "Débito"}
              </button>
            ))}
          </div>

          {method !== "pix" && (
            <div className="mt-4 space-y-3">
              <Input placeholder="Nome no cartão" className="h-11 rounded-xl" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
              <Input placeholder="Número do cartão" className="h-11 rounded-xl" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="MM/AA" className="h-11 rounded-xl" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} />
                <Input placeholder="CVV" className="h-11 rounded-xl" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
              </div>
            </div>
          )}

          {method === "pix" && (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-4 text-center text-sm text-muted-foreground">
              Ao confirmar, geraremos um QR Code PIX para pagamento.
            </div>
          )}
        </section>
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md px-5 py-3">
          <Button
            onClick={pay}
            className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90"
          >
            Pagar R$ {plan.price.toFixed(2).replace(".", ",")} — {plan.name}
          </Button>
        </div>
      </div>

      <ProBottomNav />
    </div>
  );
}
