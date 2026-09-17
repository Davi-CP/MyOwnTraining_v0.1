import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";
import { modalities } from "../data/modalities";

export type Filters = {
  location: string;
  modality: (typeof modalities)[number] | "Todos";
  maxPrice: number;
};

export const DEFAULT_FILTERS: Filters = {
  location: "",
  modality: "Todos",
  maxPrice: 200,
};

type Props = {
  open: boolean;
  onClose: () => void;
  value: Filters;
  onApply: (filters: Filters) => void;
  modalities?: readonly string[];
};

export function FilterSheet({ open, onClose, value, onApply, modalities: available = modalities }: Props) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) {
      setDraft(value);
    }
  }, [open, value]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-background p-5 pb-8 shadow-[var(--shadow-soft)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Filtros</h2>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mb-4 block text-left">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Localização
          </span>
          <input
            value={draft.location}
            onChange={(event) => setDraft({ ...draft, location: event.target.value })}
            placeholder="Bairro, cidade ou CEP"
            className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-[var(--brand-yellow)]"
          />
        </label>

        <div className="mb-4 text-left">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Modalidade
          </span>
          <div className="flex max-h-32 flex-wrap gap-2 overflow-y-auto">
            {(["Todos", ...available] as const).map((modality) => (
              <button
                key={modality}
                type="button"
                onClick={() => setDraft({ ...draft, modality: modality as Filters["modality"] })}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                  draft.modality === modality
                    ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white"
                    : "border-border bg-card text-muted-foreground"
                }`}
              >
                {modality}
              </button>
            ))}
          </div>
        </div>

        <label className="mb-6 block text-left">
          <span className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Preço máximo <span className="font-bold text-foreground">R$ {draft.maxPrice}/h</span>
          </span>
          <input
            type="range"
            min={50}
            max={300}
            step={10}
            value={draft.maxPrice}
            onChange={(event) => setDraft({ ...draft, maxPrice: Number(event.target.value) })}
            className="w-full accent-[var(--brand-yellow)]"
          />
        </label>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 rounded-xl"
            onClick={() => {
              setDraft(DEFAULT_FILTERS);
              onApply(DEFAULT_FILTERS);
              onClose();
            }}
          >
            Limpar
          </Button>
          <Button
            type="button"
            className="h-12 flex-1 rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90"
            onClick={() => {
              onApply(draft);
              onClose();
            }}
          >
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
