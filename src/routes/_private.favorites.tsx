import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { BottomNav } from "../shared/components/bottom-nav";
import { TrainerCard } from "../shared/components/trainer-card";
import { useFavorites } from "../modules/marketplace/hooks/use-favorites";
import { useToggleFavorite } from "../modules/marketplace/hooks/use-toggle-favorite";

export const Route = createFileRoute("/_private/favorites")({
  component: FavoritesPage,
  head: () => ({ meta: [{ title: "MyOwnTraining — Favoritos" }] }),
});

function FavoritesPage() {
  const { data: favoriteTrainers = [], isLoading } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6 text-left">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Favoritos</p>
        <h1 className="mt-2 text-2xl font-bold">Seus favoritos</h1>

        <div className="mt-5 rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <Heart className="h-5 w-5 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
            <p className="text-sm text-muted-foreground">Ações como boost, mudança de preço e nova disponibilidade podem gerar notificações inteligentes.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Carregando favoritos...</p>}
          {!isLoading && favoriteTrainers.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Você ainda não favoritou nenhum profissional.</p>
          )}
          {favoriteTrainers.map((trainer) => (
            <TrainerCard
              key={trainer.id}
              trainer={trainer}
              isFavorite
              onToggleFavorite={() => toggleFavorite.mutate(trainer.id)}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}