import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useStored, KEYS, DEFAULT_PERSONAL, type Personal } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/profile_/personal")({
  component: PersonalData,
  head: () => ({ meta: [{ title: "Dados pessoais — MyOwnTraining" }] }),
});

const FIELDS: { key: keyof Personal; label: string; type?: string }[] = [
  { key: "name", label: "Nome completo" },
  { key: "birth", label: "Data de nascimento", type: "date" },
  { key: "gender", label: "Sexo" },
  { key: "phone", label: "Telefone" },
  { key: "email", label: "Email", type: "email" },
  { key: "doc", label: "CPF / Documento" },
  { key: "address", label: "Endereço" },
  { key: "city", label: "Cidade" },
  { key: "state", label: "Estado" },
];

function PersonalData() {
  const nav = useNavigate();
  const [stored, setStored] = useStored<Personal>(KEYS.personal, DEFAULT_PERSONAL);
  const [data, setData] = useState<Personal>(stored);

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Dados pessoais</h1>
        </div>

        <div className="space-y-3">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">{f.label}</span>
              <input
                type={f.type ?? "text"}
                value={data[f.key]}
                onChange={(e) => setData({ ...data, [f.key]: e.target.value })}
                className="h-12 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-[var(--brand-yellow)]"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-md px-5 py-3">
          <Button
            onClick={() => { setStored(data); toast.success("Dados atualizados"); nav({ to: "/profile" }); }}
            className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
            Salvar alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
