import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, MessageSquareText, Star } from "lucide-react";
import { useState } from "react";
import { BottomNav } from "../shared/components/bottom-nav";
import { Button } from "../shared/components/button";
import { ReviewModal } from "../shared/components/review-modal";
import { formatDistance } from "../shared/lib/utils";
import { useTrainer } from "../modules/marketplace/hooks/use-trainer";

export const Route = createFileRoute("/_private/trainer/$id")({
  component: TrainerPage,
});

function TrainerAvatar({ name, photo }: { name: string; photo: string | null }) {
  if (photo) {
    return <img src={photo} alt={name} className="h-56 w-full object-cover" />;
  }
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div className="flex h-56 w-full items-center justify-center bg-muted text-4xl font-bold text-muted-foreground">
      {initials || "PT"}
    </div>
  );
}

function TrainerPage() {
  const { id } = Route.useParams();
  const { data: trainer, isLoading } = useTrainer(id);
  const [reviewOpen, setReviewOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="mx-auto max-w-md px-5 pt-6 text-left">
          <p className="py-10 text-center text-sm text-muted-foreground">Carregando profissional...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="mx-auto max-w-md px-5 pt-6 text-left">
          <p className="py-10 text-center text-sm text-muted-foreground">Profissional não encontrado.</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6 text-left">
        <div className="overflow-hidden rounded-[2rem] bg-card shadow-[var(--shadow-soft)]">
          <TrainerAvatar name={trainer.name} photo={trainer.photo} />
          <div className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">{trainer.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {trainer.specialties.join(" · ")}
                </p>
              </div>
              {trainer.boosted && (
                <span className="rounded-full bg-[var(--brand-yellow)] px-3 py-1 text-[11px] font-bold uppercase text-[var(--brand-black)]">
                  Patrocinado
                </span>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 font-medium">
                <Star className="h-4 w-4 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
                {trainer.rating.toFixed(1)}
              </span>
              {trainer.distanceKm != null && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {formatDistance(trainer.distanceKm)} km
                </span>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              Atuação em {trainer.neighborhood || "região próxima"}, {trainer.city}. UI pronta para detalhes do perfil, agendamento e avaliações.
            </p>

            <div className="flex gap-2">
              <Button asChild className="h-12 flex-1 rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
                <Link to="/bookings">Agendar</Link>
              </Button>
              <Button variant="outline" className="h-12 rounded-xl px-4" onClick={() => setReviewOpen(true)}>
                <MessageSquareText className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ReviewModal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        trainerName={trainer.name}
      />

      <BottomNav />
    </div>
  );
}