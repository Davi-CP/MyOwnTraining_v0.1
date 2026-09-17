import { X } from "lucide-react";
import { useState } from "react";
import { MODALITIES, type Modality } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export type Filters = {
  location: string;
  modality: Modality | "Todos";
  maxPrice: number;
};

export const DEFAULT_FILTERS: Filters = { location: "", modality: "Todos", maxPrice: 200 };

export function FilterSheet({
  open, onClose, value, onApply, modalities,
}: { open: boolean; onClose: () => void; value: Filters; onApply: (f: Filters) => void; modalities?: Modality[] }) {
  const [f, setF] = useState<Filters>(value);
  const mods = modalities ?? MODALITIES;
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-background p-5 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Filtros</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mb-4 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Localização</span>
          <input
            value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })}
            placeholder="Bairro, cidade ou CEP"
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-[var(--brand-yellow)]"
          />
        </label>

        <div className="mb-4">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Modalidade</span>
          <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
            {(["Todos", ...mods] as const).map((m) => (
              <button key={m} type="button" onClick={() => setF({ ...f, modality: m })}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  f.modality === m
                    ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white"
                    : "border-border bg-card text-muted-foreground"
                }`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <label className="mb-6 block">
          <span className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Preço máximo <span className="font-bold text-foreground">R$ {f.maxPrice}/h</span>
          </span>
          <input type="range" min={50} max={300} step={10}
            value={f.maxPrice} onChange={(e) => setF({ ...f, maxPrice: Number(e.target.value) })}
            className="w-full accent-[var(--brand-yellow)]"
          />
        </label>

        <div className="flex gap-2">
          <Button variant="outline" className="h-12 flex-1 rounded-xl"
            onClick={() => { setF(DEFAULT_FILTERS); onApply(DEFAULT_FILTERS); onClose(); }}>
            Limpar
          </Button>
          <Button className="h-12 flex-1 rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90"
            onClick={() => { onApply(f); onClose(); }}>
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
