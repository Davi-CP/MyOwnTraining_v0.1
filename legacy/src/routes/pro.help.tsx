import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { ProBottomNav } from "@/components/ProBottomNav";

export const Route = createFileRoute("/pro/help")({
  component: HelpPage,
  head: () => ({ meta: [{ title: "Ajuda — MyOwnTraining" }] }),
});

const FAQ = [
  { q: "Como recebo meus pagamentos?", a: "Os pagamentos caem em seu saldo após a conclusão do treino e ficam disponíveis para saque via PIX." },
  { q: "Posso cancelar um agendamento?", a: "Sim. Cancelamentos com menos de 2 horas geram penalidade de 30% e reembolso ao aluno." },
  { q: "Como funciona o programa de fidelidade?", a: "A cada 7 treinos concluídos sua taxa é reduzida para 7%." },
  { q: "O que é o Impulsionar?", a: "Plano que coloca seu perfil no topo do mapa e da lista de profissionais." },
  { q: "Como aprovo um treino recorrente?", a: "Vá ao Dashboard → Novos pedidos e clique em Aceitar. Conflitos de horário são bloqueados automaticamente." },
];

function HelpPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/pro/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="flex-1 text-xl font-bold">Ajuda</h1>
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Dúvidas frequentes sobre pagamentos, agendamentos e funcionamento do app.
        </p>
        <div className="space-y-2">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
              <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
              <p className="mt-2 text-xs text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
        <Link to="/pro/support" className="mt-6 block rounded-2xl bg-[var(--brand-yellow)] p-4 text-center text-sm font-bold text-[var(--brand-black)]">
          Não encontrei minha dúvida — falar com o suporte
        </Link>
      </div>
      <ProBottomNav />
    </div>
  );
}
