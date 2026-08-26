import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Star, MapPin, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { TRAINERS } from "@/lib/mock-data";
import { useStored, KEYS } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
  head: () => ({ meta: [{ title: "Favoritos — MyOwnTraining" }] }),
});

function FavoritesPage() {
  const [favs, setFavs] = useStored<string[]>(KEYS.favorites, []);
  const list = TRAINERS.filter((t) => favs.includes(t.id));

  const remove = (id: string, name: string) => {
    setFavs((prev) => prev.filter((x) => x !== id));
    toast.success("Removido dos favoritos", { description: name });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-8">
        <h1 className="text-xl font-bold">Favoritos</h1>
        <p className="mb-5 text-sm text-muted-foreground">
          {list.length} {list.length === 1 ? "profissional salvo" : "profissionais salvos"}
        </p>

        {list.length === 0 ? (
          <div className="rounded-2xl bg-card p-8 text-center shadow-[var(--shadow-soft)]">
            <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">Nenhum favorito ainda</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Toque no coração no card de um profissional para salvá-lo aqui.
            </p>
            <Link to="/home" className="mt-4 inline-flex items-center justify-center rounded-xl bg-[var(--brand-yellow)] px-4 py-2 text-xs font-semibold text-[var(--brand-black)]">
              Explorar profissionais
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((t) => (
              <div key={t.id} className="flex gap-3 rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]">
                <Link to="/trainer/$id" params={{ id: t.id }} className="shrink-0">
                  <img src={t.photo} alt={t.name} className="h-20 w-20 rounded-xl bg-muted object-cover" />
                </Link>
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Link to="/trainer/$id" params={{ id: t.id }} className="truncate font-semibold">
                        {t.name}
                      </Link>
                      <button onClick={() => remove(t.id, t.name)} aria-label="Remover" className="shrink-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{t.specialties.join(" · ")}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium">
                        <Star className="h-3.5 w-3.5 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
                        {t.rating}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {t.distanceKm} km
                      </span>
                    </div>
                    <span className="font-semibold">R$ {t.pricePerHour}<span className="font-normal text-muted-foreground">/h</span></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
