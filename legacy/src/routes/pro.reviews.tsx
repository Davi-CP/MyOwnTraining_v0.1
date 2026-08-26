import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { ProBottomNav } from "@/components/ProBottomNav";
import { TRAINERS } from "@/lib/mock-data";

export const Route = createFileRoute("/pro/reviews")({
  component: ProReviews,
  head: () => ({ meta: [{ title: "Avaliações — MyOwnTraining" }] }),
});

type R = { id: string; name: string; photo: string; rating: number; text: string; date: string };

const MOCK: R[] = [
  { id: "rv1", name: "Marina Castro", photo: "https://api.dicebear.com/7.x/personas/svg?seed=Marina&backgroundColor=ffc700",
    rating: 5, text: "Treino excelente! Muito atencioso e motivador.", date: "12 mai" },
  { id: "rv2", name: "Pedro Lima", photo: "https://api.dicebear.com/7.x/personas/svg?seed=Pedro&backgroundColor=ffd740",
    rating: 5, text: "Resultados surpreendentes em poucas semanas.", date: "08 mai" },
  { id: "rv3", name: "Júlia Souza", photo: "https://api.dicebear.com/7.x/personas/svg?seed=JuliaS&backgroundColor=ffeb3b",
    rating: 4, text: "Muito bom, recomendo.", date: "02 mai" },
  { id: "rv4", name: "Carlos Mendes", photo: "https://api.dicebear.com/7.x/personas/svg?seed=Carlos&backgroundColor=ffc700",
    rating: 5, text: "Profissional dedicado.", date: "28 abr" },
];

function ProReviews() {
  const me = TRAINERS[0];
  const avg = MOCK.reduce((s, r) => s + r.rating, 0) / MOCK.length;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <h1 className="mb-4 text-xl font-bold">Avaliações</h1>

        <div className="mb-5 rounded-2xl bg-[var(--brand-black)] p-5 text-center text-white">
          <div className="flex items-center justify-center gap-1">
            <Star className="h-6 w-6 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
            <span className="text-3xl font-bold">{me.rating ?? avg.toFixed(1)}</span>
          </div>
          <p className="mt-1 text-xs opacity-80">Baseado em {MOCK.length * 33} avaliações</p>
        </div>

        <div className="space-y-3">
          {MOCK.map((r) => (
            <div key={r.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
              <div className="flex items-center gap-3">
                <img src={r.photo} alt="" className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">{r.date}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" : "text-muted-foreground"}`} />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
      <ProBottomNav />
    </div>
  );
}
