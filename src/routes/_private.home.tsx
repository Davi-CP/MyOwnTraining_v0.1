import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { BottomNav } from "../shared/components/bottom-nav";
import { Button } from "../shared/components/button";
import { FilterSheet, DEFAULT_FILTERS, type Filters } from "../shared/components/filter-sheet";
import { Input } from "../shared/components/input";
import { MapMock } from "../shared/components/map-mock";
import { TrainerCard } from "../shared/components/trainer-card";
import { modalities, trainers } from "../shared/data/mock-domain";

export const Route = createFileRoute("/_private/home")({
  component: HomePage,
  head: () => ({ meta: [{ title: "MyOwnTraining — Início" }] }),
});

function HomePage() {
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const visibleTrainers = useMemo(
    () =>
      trainers.filter((trainer) => {
        const search = query.trim().toLowerCase();
        const modalityMatch =
          filters.modality === "Todos" || trainer.specialties.includes(filters.modality);
        const locationMatch =
          !filters.location ||
          `${trainer.neighborhood} ${trainer.city}`.toLowerCase().includes(filters.location.toLowerCase());
        const searchMatch =
          !search ||
          trainer.name.toLowerCase().includes(search) ||
          trainer.specialties.some((specialty) => specialty.toLowerCase().includes(search)) ||
          trainer.neighborhood.toLowerCase().includes(search) ||
          trainer.city.toLowerCase().includes(search);
        const priceMatch = trainer.pricePerHour <= filters.maxPrice;

        return searchMatch && modalityMatch && locationMatch && priceMatch;
      }),
    [filters, query],
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto flex max-w-md flex-col gap-5 px-5 pt-6 text-left">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Descubra</p>
            <h1 className="mt-2 text-2xl font-bold">PTs perto de você</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-yellow)]">
            <Sparkles className="h-5 w-5 text-[var(--brand-black)]" />
          </div>
        </div>

        <div className="rounded-3xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <div className="mb-3 flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nome ou modalidade"
                className="h-11 rounded-xl pl-10"
              />
            </div>
            <Button type="button" variant="outline" className="h-11 rounded-xl px-3" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {modalities.map((modality) => (
              <span key={modality} className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                {modality}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <MapMock trainers={visibleTrainers} />
      </div>

      <div className="mx-auto mt-5 grid max-w-md gap-3 px-5 text-left">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Resultados</h2>
          <span className="text-xs text-muted-foreground">{visibleTrainers.length} profissionais</span>
        </div>
        {visibleTrainers.map((trainer) => (
          <TrainerCard key={trainer.id} trainer={trainer} />
        ))}
      </div>

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onApply={setFilters}
      />

      <BottomNav />
    </div>
  );
}
