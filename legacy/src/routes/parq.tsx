import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Upload } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const QUESTIONS = [
  "Algum médico já disse que você tem problema cardíaco?",
  "Sente dores no peito ao realizar atividade física?",
  "No último mês teve dores no peito sem fazer atividade?",
  "Perde o equilíbrio devido a tonturas ou já perdeu a consciência?",
  "Tem algum problema ósseo ou articular que possa piorar com exercício?",
  "Toma medicamento para pressão arterial ou condição cardíaca?",
  "Sabe de alguma outra razão pela qual você não deva praticar atividade física?",
];

export const Route = createFileRoute("/parq")({
  component: ParqPage,
  validateSearch: (s: Record<string, unknown>) => ({ id: (s.id as string) ?? "" }),
  head: () => ({ meta: [{ title: "PAR-Q — Avaliação de aptidão" }] }),
});

function ParqPage() {
  const { id } = Route.useSearch();
  const nav = useNavigate();
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(QUESTIONS.length).fill(null));
  const [terms, setTerms] = useState(false);
  const hasRisk = answers.some((a) => a === true);
  const allAnswered = answers.every((a) => a !== null);
  const canContinue = allAnswered && terms;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/booking/$id" params={{ id }} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Sua segurança em 1º lugar</h1>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-[var(--brand-yellow)]/20 p-4">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
          <p className="text-xs leading-relaxed">
            Antes do seu primeiro treino, responda este questionário PAR-Q. Suas respostas ficam confidenciais e ajudam o profissional a treinar você com segurança.
          </p>
        </div>

        <div className="space-y-3">
          {QUESTIONS.map((q, i) => (
            <div key={i} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
              <p className="mb-3 text-sm">{i + 1}. {q}</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Sim", val: true },
                  { label: "Não", val: false },
                ].map((opt) => (
                  <button key={opt.label}
                    onClick={() => setAnswers((a) => a.map((v, j) => j === i ? opt.val : v))}
                    className={`rounded-xl border py-2 text-sm font-medium ${
                      answers[i] === opt.val
                        ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white"
                        : "border-border bg-background"
                    }`}>{opt.label}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {hasRisk && (
          <div className="mt-5 rounded-2xl border border-dashed border-[var(--brand-yellow)] bg-[var(--brand-yellow)]/10 p-4">
            <p className="mb-3 text-sm font-medium">Detectamos uma condição de risco. Anexe um atestado médico para liberação.</p>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium">
              <Upload className="h-4 w-4" /> Enviar atestado (PDF / Imagem)
            </button>
          </div>
        )}

        <label className="mt-6 flex items-start gap-3 rounded-2xl bg-muted/60 p-4 text-xs leading-relaxed">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[var(--brand-yellow)]" />
          <span>Li e aceito o <b>termo de responsabilidade</b> e o <b>termo de aptidão física</b> da plataforma.</span>
        </label>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md px-5 py-3">
          <Button disabled={!canContinue}
            onClick={() => nav({ to: "/payment", search: { id } })}
            className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90 disabled:opacity-40">
            Continuar para pagamento
          </Button>
        </div>
      </div>
    </div>
  );
}
