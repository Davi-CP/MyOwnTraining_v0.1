import { Star, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useStored, KEYS, type Review } from "@/lib/storage";
import { toast } from "sonner";

export function ReviewModal({
  open, onClose, trainerId, trainerName,
}: { open: boolean; onClose: () => void; trainerId: string; trainerName: string }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [, setReviews] = useStored<Review[]>(KEYS.reviews, []);
  if (!open) return null;

  const submit = () => {
    setReviews((prev) => [
      { id: `r-${Date.now()}`, trainerId, rating, text: text.trim(), date: "agora", author: "Você" },
      ...prev,
    ]);
    toast.success("Avaliação enviada", { description: `Obrigado por avaliar ${trainerName}.` });
    setText(""); setRating(5);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-background p-5 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Avaliar {trainerName}</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex justify-center gap-1">
          {[1,2,3,4,5].map((n) => (
            <button key={n} onClick={() => setRating(n)}>
              <Star className={`h-9 w-9 ${n <= rating ? "fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>

        <label className="mb-5 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comentário (opcional)</span>
          <textarea
            value={text} onChange={(e) => setText(e.target.value)} maxLength={500} rows={4}
            placeholder="Como foi sua experiência?"
            className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-[var(--brand-yellow)]"
          />
        </label>

        <Button onClick={submit}
          className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
          Enviar avaliação
        </Button>
      </div>
    </div>
  );
}
