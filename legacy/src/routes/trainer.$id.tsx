import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Star, MapPin, MessageCircle, BadgeCheck, GraduationCap, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TRAINERS, REVIEWS, type Trainer } from "@/lib/mock-data";
import { useStored, KEYS, type Review } from "@/lib/storage";

export const Route = createFileRoute("/trainer/$id")({
  component: TrainerProfile,
  loader: ({ params }) => {
    const trainer = TRAINERS.find((t) => t.id === params.id);
    if (!trainer) throw notFound();
    return { trainer };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.trainer.name ?? "Profissional"} — MyOwnTraining` }],
  }),
});

function TrainerProfile() {
  const { trainer } = Route.useLoaderData() as { trainer: Trainer };
  const [stored] = useStored<Review[]>(KEYS.reviews, []);
  const reviews = [...stored.filter((r) => r.trainerId === trainer.id), ...REVIEWS.filter((r) => r.trainerId === trainer.id)];
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : trainer.rating;
  const total = trainer.reviewsCount + stored.filter((r) => r.trainerId === trainer.id).length;

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="mx-auto max-w-md">
        {/* Hero */}
        <div className="relative h-72 bg-gradient-to-br from-[var(--brand-yellow)] to-[#FFD740]">
          <Link to="/home" className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <img src={trainer.photo} alt={trainer.name}
            className="absolute left-1/2 top-12 h-40 w-40 -translate-x-1/2 rounded-3xl border-4 border-white bg-white object-cover shadow-lg" />
        </div>

        <div className="px-5 pt-6">
          <div className="text-center">
            {trainer.boosted && (
              <span className="mb-2 inline-block rounded-full bg-[var(--brand-black)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--brand-yellow)]">
                ★ Premium · Patrocinado
              </span>
            )}
            <h1 className="text-2xl font-bold">{trainer.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{trainer.specialties.join(" · ")}</p>
            <div className="mt-3 flex items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-1 font-semibold">
                <Star className="h-4 w-4 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
                {avg.toFixed(1)} <span className="font-normal text-muted-foreground">({total})</span>
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" /> {trainer.distanceKm} km
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="font-semibold">R$ {trainer.pricePerHour}/h</span>
            </div>
          </div>

          {/* About */}
          <section className="mt-8">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sobre</h2>
            <p className="text-sm leading-relaxed">{trainer.bio}</p>
          </section>

          {/* Credentials */}
          <section className="mt-6 space-y-2 rounded-2xl bg-muted/60 p-4">
            <div className="flex items-center gap-2 text-sm">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              {trainer.education}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BadgeCheck className="h-4 w-4 text-[var(--brand-yellow)]" />
              CREF {trainer.cref} {trainer.crefValidated && <span className="text-xs font-medium text-green-600">· verificado</span>}
            </div>
          </section>

          {/* Availability */}
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Disponibilidade</h2>
            <div className="flex flex-wrap gap-2">
              {trainer.availability.map((a) => (
                <span key={a} className="flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-medium shadow-[var(--shadow-soft)]">
                  <Calendar className="h-3 w-3" /> {a}
                </span>
              ))}
            </div>
          </section>

          {/* Gallery */}
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Galeria</h2>
            <div className="grid grid-cols-3 gap-2">
              {trainer.gallery.map((g, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-xl bg-muted">
                  <img src={g} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Avaliações</h2>
            <div className="space-y-3">
              {reviews.length === 0 && (
                <p className="text-sm text-muted-foreground">Ainda sem avaliações.</p>
              )}
              {reviews.map((r) => (
                <div key={r.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{r.author}</p>
                    <span className="flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
                      {r.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.date}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-md gap-2 px-5 py-3">
          <Button asChild variant="outline" className="h-12 w-12 shrink-0 rounded-xl p-0">
            <Link to="/chat/$id" params={{ id: trainer.id }} aria-label="Abrir chat">
              <MessageCircle className="h-5 w-5" />
            </Link>
          </Button>
          <Button asChild className="h-12 flex-1 rounded-xl bg-[var(--brand-yellow)] text-base font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
            <Link to="/booking/$id" params={{ id: trainer.id }}>Agendar treino</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
