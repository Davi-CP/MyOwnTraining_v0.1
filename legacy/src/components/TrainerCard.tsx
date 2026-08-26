import { Star, MapPin, Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Trainer } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useStored, KEYS, pushNotification } from "@/lib/storage";
import { toast } from "sonner";

const FAVORITE_TRIGGERS = [
  (name: string) => ({ title: "Novo horário disponível", body: `${name} abriu horário amanhã.` }),
  (name: string) => ({ title: "Promoção do seu favorito", body: `${name} está com desconto especial esta semana.` }),
  (name: string) => ({ title: "Disponível por perto", body: `${name} está disponível na sua região hoje.` }),
];

export function TrainerCard({ trainer }: { trainer: Trainer }) {
  const [favs, setFavs] = useStored<string[]>(KEYS.favorites, []);
  const isFav = favs.includes(trainer.id);

  const toggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    setFavs((prev) => {
      const has = prev.includes(trainer.id);
      const next = has ? prev.filter((x) => x !== trainer.id) : [...prev, trainer.id];
      toast.success(has ? "Removido dos favoritos" : "Adicionado aos favoritos", {
        description: trainer.name,
      });
      if (!has) {
        const pick = FAVORITE_TRIGGERS[Math.floor(Math.random() * FAVORITE_TRIGGERS.length)](trainer.name);
        pushNotification({ audience: "client", title: pick.title, body: pick.body });
      }
      return next;
    });
  };


  return (
    <Link
      to="/trainer/$id" params={{ id: trainer.id }}
      className="group flex gap-3 rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98]"
    >
      <img src={trainer.photo} alt={trainer.name} className="h-20 w-20 shrink-0 rounded-xl bg-muted object-cover" />
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold">
              {trainer.name}
              {trainer.boosted && (
                <span className="ml-1.5 rounded-full bg-[var(--brand-yellow)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--brand-black)] align-middle">
                  Patrocinado
                </span>
              )}
            </h3>
            <button onClick={toggleFav} aria-label="Favoritar" className="shrink-0 text-muted-foreground hover:text-foreground">
              <Heart className={cn("h-5 w-5 transition-colors", isFav && "fill-[var(--brand-yellow)] text-[var(--brand-yellow)]")} />
            </button>
          </div>
          <p className="truncate text-xs text-muted-foreground">{trainer.specialties.join(" · ")}</p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <Star className="h-3.5 w-3.5 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
              {trainer.rating}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {trainer.distanceKm} km
            </span>
          </div>
          <span className="font-semibold">R$ {trainer.pricePerHour}<span className="text-muted-foreground font-normal">/h</span></span>
        </div>
      </div>
    </Link>
  );
}
