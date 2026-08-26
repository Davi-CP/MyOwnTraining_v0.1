import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Bell } from "lucide-react";
import { useMemo, useState } from "react";
import { MapMock } from "@/components/MapMock";
import { TrainerCard } from "@/components/TrainerCard";
import { BottomNav } from "@/components/BottomNav";
import { FilterSheet, DEFAULT_FILTERS, type Filters } from "@/components/FilterSheet";
import { TRAINERS, MODALITIES, type Modality } from "@/lib/mock-data";
import { useStored, KEYS, type CustomModalityRequest } from "@/lib/storage";

export const Route = createFileRoute("/home")({
  component: HomePage,
  head: () => ({ meta: [{ title: "Personal trainers próximos — MyOwnTraining" }] }),
});

function HomePage() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Modality | "Todos">("Todos");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sheet, setSheet] = useState(false);
  const [customMods] = useStored<CustomModalityRequest[]>(KEYS.customModalities, []);
  const allModalities = useMemo(
    () => Array.from(new Set([...MODALITIES, ...customMods.filter((m) => m.status === "approved").map((m) => m.name)])),
    [customMods],
  );


  const list = useMemo(() => {
    return TRAINERS.filter((t) => {
      const matchQ = !query || t.name.toLowerCase().includes(query.toLowerCase());
      const matchM = active === "Todos" || t.specialties.includes(active);
      const matchAdvM = filters.modality === "Todos" || t.specialties.includes(filters.modality);
      const matchPrice = t.pricePerHour <= filters.maxPrice;
      const matchLoc = !filters.location; // mock: location filter is informational
      return matchQ && matchM && matchAdvM && matchPrice && matchLoc;
    }).sort((a, b) => {
      if (!!b.boosted !== !!a.boosted) return b.boosted ? 1 : -1;
      return a.distanceKm - b.distanceKm;
    });
  }, [query, active, filters]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md">
        <header className="flex items-center justify-between px-5 pt-6 pb-3">
          <div>
            <p className="text-xs text-muted-foreground">Sua localização</p>
            <p className="text-sm font-semibold">Vila Madalena, SP</p>
          </div>
          <Link to="/notifications" aria-label="Notificações" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Bell className="h-5 w-5" />
          </Link>
        </header>

        <MapMock trainers={list} />

        <div className="mt-4 px-5">
          <div className="flex items-center gap-2 rounded-2xl bg-card p-2 shadow-[var(--shadow-soft)]">
            <div className="flex flex-1 items-center gap-2 px-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar profissional ou modalidade"
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button onClick={() => setSheet(true)} aria-label="Abrir filtros"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-yellow)]">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-2">
            {(["Todos", ...allModalities]).map((m) => (
              <button key={m} onClick={() => setActive(m)}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                  active === m
                    ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white"
                    : "border-border bg-card text-muted-foreground"
                }`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 px-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold">Próximos a você</h2>
              <Link to="/ranking" className="rounded-full bg-[var(--brand-yellow)] px-2.5 py-0.5 text-xs font-semibold text-[var(--brand-black)]">
                Ranking
              </Link>
            </div>
            <span className="text-xs text-muted-foreground">{list.length} profissionais</span>
          </div>
          <div className="space-y-3">
            {list.map((t) => <TrainerCard key={t.id} trainer={t} />)}
            {list.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">Nenhum profissional encontrado.</p>
            )}
          </div>
        </div>
      </div>

      <FilterSheet open={sheet} onClose={() => setSheet(false)} value={filters} onApply={setFilters} modalities={allModalities} />
      <BottomNav />
    </div>
  );
}
