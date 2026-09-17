import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, MapPin, Star } from "lucide-react";
import { useState } from "react";
import { TRAINERS } from "@/lib/mock-data";
import { useStored, KEYS, DEFAULT_SESSIONS, type Session, type Review } from "@/lib/storage";
import { ReviewModal } from "@/components/ReviewModal";

export const Route = createFileRoute("/profile_/history")({
  component: History,
  head: () => ({ meta: [{ title: "Histórico de treinos — MyOwnTraining" }] }),
});

function History() {
  const [sessions] = useStored<Session[]>(KEYS.sessions, DEFAULT_SESSIONS);
  const [reviews] = useStored<Review[]>(KEYS.reviews, []);
  const [reviewOf, setReviewOf] = useState<{ id: string; name: string } | null>(null);

  const completed = sessions.filter((s) => s.status === "completed");

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Histórico de treinos</h1>
        </div>

        {completed.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">Nenhum treino concluído ainda.</p>
        )}

        <div className="space-y-3">
          {completed.map((s) => {
            const t = TRAINERS.find((x) => x.id === s.trainerId);
            if (!t) return null;
            const myReview = reviews.find((r) => r.trainerId === t.id && r.author === "Você");
            return (
              <div key={s.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-3">
                  <img src={t.photo} alt="" className="h-12 w-12 rounded-xl bg-muted" />
                  <div className="flex-1">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.specialties[0]}</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Concluído</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {s.date} · {s.time}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration} min</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.place}</span>
                </div>
                <div className="mt-3">
                  {myReview ? (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
                      Você avaliou com {myReview.rating} estrelas
                    </div>
                  ) : (
                    <button onClick={() => setReviewOf({ id: t.id, name: t.name })}
                      className="flex items-center gap-1.5 rounded-xl bg-[var(--brand-yellow)] px-3 py-2 text-xs font-semibold">
                      <Star className="h-3.5 w-3.5" /> Avaliar treino
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ReviewModal
        open={!!reviewOf}
        onClose={() => setReviewOf(null)}
        trainerId={reviewOf?.id ?? ""}
        trainerName={reviewOf?.name ?? ""}
      />
    </div>
  );
}
