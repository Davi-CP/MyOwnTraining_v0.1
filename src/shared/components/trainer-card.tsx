import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Star } from "lucide-react";
import { useState } from "react";
import type { MouseEvent } from "react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { formatDistance } from "../lib/utils";
import type { Trainer } from "../../modules/marketplace/domain/marketplace.types";

type Props = {
  trainer: Trainer;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
};

function TrainerAvatar({ name, photo }: { name: string; photo: string | null }) {
  if (photo) {
    return <img src={photo} alt={name} className="h-20 w-20 shrink-0 rounded-xl bg-muted object-cover" />;
  }
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-muted text-lg font-bold text-muted-foreground">
      {initials || "PT"}
    </div>
  );
}

export function TrainerCard({ trainer, isFavorite, onToggleFavorite }: Props) {
  const [localFavorite, setLocalFavorite] = useState(false);
  const favorite = isFavorite ?? localFavorite;

  const toggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const nextFavorite = !favorite;
    toast.success(nextFavorite ? "Adicionado aos favoritos" : "Removido dos favoritos", {
      description: trainer.name,
    });
    if (onToggleFavorite) {
      onToggleFavorite();
    } else {
      setLocalFavorite(nextFavorite);
    }
  };

  return (
    <Link
      to="/trainer/$id"
      params={{ id: trainer.id }}
      className="group flex gap-3 rounded-2xl bg-card p-3 text-left shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98]"
    >
      <TrainerAvatar name={trainer.name} photo={trainer.photo} />
      <div className="flex min-w-0 flex-1 flex-col justify-between">
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
            <button
              type="button"
              onClick={toggleFavorite}
              aria-label="Favoritar"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Heart
                className={cn(
                  "h-5 w-5 transition-colors",
                  favorite && "fill-[var(--brand-yellow)] text-[var(--brand-yellow)]",
                )}
              />
            </button>
          </div>
          <p className="truncate text-xs text-muted-foreground">{trainer.specialties.join(" · ")}</p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <Star className="h-3.5 w-3.5 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
              {trainer.rating.toFixed(1)}
            </span>
            {trainer.distanceKm != null && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> {formatDistance(trainer.distanceKm)} km
              </span>
            )}
          </div>
          <span className="font-semibold">
            R$ {trainer.pricePerHour}
            <span className="font-normal text-muted-foreground">/h</span>
          </span>
        </div>
      </div>
    </Link>
  );
}