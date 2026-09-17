import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MODALITIES } from "@/lib/mock-data";
import { useState } from "react";

export const Route = createFileRoute("/pro/signup")({
  component: ProSignup,
  head: () => ({ meta: [{ title: "Cadastro profissional — MyOwnTraining" }] }),
});

function ProSignup() {
  const [selected, setSelected] = useState<string[]>(["Musculação"]);
  const toggle = (m: string) =>
    setSelected((s) => s.includes(m) ? s.filter((x) => x !== m) : [...s, m]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/pro/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Cadastro profissional</h1>
        </div>

        <div className="space-y-4">
          <Field label="Nome completo"><Input className="h-11 rounded-xl" defaultValue="Ricardo Alves" /></Field>
          <Field label="CREF"><Input className="h-11 rounded-xl" placeholder="000000-G/UF" defaultValue="012345-G/SP" /></Field>
          <Field label="Formação acadêmica"><Input className="h-11 rounded-xl" defaultValue="Bacharel em Educação Física - USP" /></Field>
          <Field label="Descrição">
            <textarea rows={3} className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-[var(--brand-yellow)]"
              defaultValue="Especialista em hipertrofia e condicionamento físico." />
          </Field>

          <Field label="Especialidades">
            <div className="flex flex-wrap gap-2">
              {MODALITIES.map((m) => (
                <button key={m} onClick={() => toggle(m)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                    selected.includes(m)
                      ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white"
                      : "border-border bg-card text-muted-foreground"
                  }`}>{m}</button>
              ))}
            </div>
          </Field>

          <Field label="Locais atendidos"><Input className="h-11 rounded-xl" defaultValue="Vila Madalena, Pinheiros, Perdizes" /></Field>
          <Field label="Disponibilidade"><Input className="h-11 rounded-xl" defaultValue="Seg–Sex 06h–11h, 17h–21h" /></Field>
          <Field label="Valor por aula (R$)"><Input type="number" className="h-11 rounded-xl" defaultValue="90" /></Field>

          <Field label="Mídias e documentos">
            <div className="grid grid-cols-2 gap-2">
              <UploadBox label="Fotos / vídeos" />
              <UploadBox label="Diploma / CREF" />
            </div>
          </Field>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md px-5 py-3">
          <Button asChild className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
            <Link to="/pro/dashboard">Salvar perfil</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function UploadBox({ label }: { label: string }) {
  return (
    <button className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card text-xs text-muted-foreground">
      <Upload className="h-5 w-5" /> {label}
    </button>
  );
}
