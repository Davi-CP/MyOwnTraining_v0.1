import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/client/help")({
  component: HelpPage,
  head: () => ({ meta: [{ title: "Ajuda — MyOwnTraining" }] }),
});

const FAQ = [
  { q: "Como agendar um treino?", a: "Encontre um profissional no mapa ou lista, abra o perfil e toque em Agendar. Escolha data, horário e local." },
  { q: "Como funciona o treino recorrente?", a: "Em Perfil → Treinos recorrentes, defina dias da semana e horário. O profissional aprova e os treinos são criados automaticamente." },
  { q: "Como cancelar um treino?", a: "Abra o treino em Treinos e toque em Cancelar. Cancelamentos com menos de 2h podem gerar penalidade." },
  { q: "Como funciona o reembolso?", a: "Em caso de cancelamento elegível ou falha do profissional, o valor é estornado automaticamente na sua forma de pagamento." },
  { q: "Como encontro profissionais próximos?", a: "Na home, o mapa mostra profissionais ativos ao seu redor. Use os filtros para refinar por modalidade e preço." },
  { q: "Como funciona o ranking?", a: "Os profissionais são ordenados por avaliação, treinos concluídos, taxa de aceitação e cancelamento. Veja em Ranking." },
  { q: "O que significa profissional Premium?", a: "Profissionais Premium aparecem em destaque por terem alta avaliação e bom desempenho na plataforma." },
  { q: "Como funciona o programa de fidelidade?", a: "A cada conjunto de treinos concluídos você desbloqueia descontos automáticos no próximo agendamento." },
  { q: "Como denunciar um problema?", a: "Vá em Suporte e abra um chamado com o tipo Comportamento inadequado ou Segurança. Nossa equipe responde rapidamente." },
  { q: "Como alterar minha forma de pagamento?", a: "Em Perfil → Pagamentos você pode adicionar, remover e definir o cartão ou PIX padrão." },
];

function HelpPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="flex-1 text-xl font-bold">Ajuda</h1>
          <HelpCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Dúvidas frequentes sobre agendamentos, pagamentos e funcionamento do app.
        </p>
        <div className="space-y-2">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
              <summary className="cursor-pointer text-sm font-semibold">{f.q}</summary>
              <p className="mt-2 text-xs text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
        <Link to="/client/support" className="mt-6 block rounded-2xl bg-[var(--brand-yellow)] p-4 text-center text-sm font-bold text-[var(--brand-black)]">
          Não encontrei minha dúvida — falar com suporte
        </Link>
      </div>
      <BottomNav />
    </div>
  );
}
