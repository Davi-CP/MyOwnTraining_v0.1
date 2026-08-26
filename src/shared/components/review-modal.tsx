import { Star, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

type Props = {
  open: boolean;
  onClose: () => void;
  trainerName: string;
  onSubmit?: (input: { rating: number; text: string }) => void;
};

export function ReviewModal({ open, onClose, trainerName, onSubmit }: Props) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  if (!open) return null;

  const submit = () => {
    onSubmit?.({ rating, text: text.trim() });
    setRating(5);
    setText("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-background p-5 pb-8 shadow-[var(--shadow-soft)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Avaliar {trainerName}</h2>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button key={value} type="button" onClick={() => setRating(value)}>
              <Star className={`h-9 w-9 ${value <= rating ? "fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>

        <label className="mb-5 block text-left">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Comentário (opcional)
          </span>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={500}
            rows={4}
            placeholder="Como foi sua experiência?"
            className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-[var(--brand-yellow)]"
          />
        </label>

        <Button
          type="button"
          onClick={submit}
          className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90"
        >
          Enviar avaliação
        </Button>
      </div>
    </div>
  );
}
