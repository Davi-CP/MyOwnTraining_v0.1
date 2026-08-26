import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Star, Trophy, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { TRAINERS, MODALITIES, trainerScore } from "@/lib/mock-data";
import { useStored, KEYS, type CustomModalityRequest } from "@/lib/storage";

export const Route = createFileRoute("/ranking")({
  component: RankingPage,
  head: () => ({ meta: [{ title: "Ranking de profissionais — MyOwnTraining" }] }),
});

type Mode = "modality" | "neighborhood";

function splitRegion(r?: string) {
  if (!r) return { bairro: "—", cidade: "—" };
  const [bairro, cidade] = r.split(",").map((s) => s.trim());
  return { bairro: bairro || "—", cidade: cidade || "—" };
}

function RankingPage() {
  const [customMods] = useStored<CustomModalityRequest[]>(KEYS.customModalities, []);
  const allMods = useMemo(
    () => Array.from(new Set([...MODALITIES, ...customMods.filter((m) => m.status === "approved").map((m) => m.name)])),
    [customMods],
  );
  const [mode, setMode] = useState<Mode>("modality");
  const [modality, setModality] = useState<string>("Todos");

  const neighborhoods = useMemo(() => {
    const set = new Set<string>();
    TRAINERS.forEach((t) => { const { bairro } = splitRegion(t.region); if (bairro !== "—") set.add(bairro); });
    return ["Todos", ...Array.from(set)];
  }, []);
  const cities = useMemo(() => {
    const set = new Set<string>();
    TRAINERS.forEach((t) => { const { cidade } = splitRegion(t.region); if (cidade !== "—") set.add(cidade); });
    return ["Todas", ...Array.from(set)];
  }, []);
  const [bairro, setBairro] = useState<string>("Todos");
  const [cidade, setCidade] = useState<string>("Todas");

  const ranked = useMemo(() => {
    let filtered = TRAINERS;
    if (mode === "modality" && modality !== "Todos") filtered = filtered.filter((t) => t.specialties.includes(modality));
    if (mode === "neighborhood") {
      if (cidade !== "Todas") filtered = filtered.filter((t) => splitRegion(t.region).cidade === cidade);
      if (bairro !== "Todos") filtered = filtered.filter((t) => splitRegion(t.region).bairro === bairro);
    }
    return [...filtered].sort((a, b) => trainerScore(b) - trainerScore(a));
  }, [mode, modality, bairro, cidade]);

  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/home" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="flex-1 text-xl font-bold">Ranking</h1>
          <Trophy className="h-5 w-5 text-[var(--brand-yellow)]" />
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          <button onClick={() => setMode("modality")}
            className={`rounded-xl border py-2 text-xs font-semibold ${mode === "modality" ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white" : "border-border bg-card"}`}>
            Por modalidade
          </button>
          <button onClick={() => setMode("neighborhood")}
            className={`rounded-xl border py-2 text-xs font-semibold ${mode === "neighborhood" ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white" : "border-border bg-card"}`}>
            Por bairro
          </button>
        </div>

        {mode === "modality" ? (
          <div className="-mx-1 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-2 px-1">
              {(["Todos", ...allMods]).map((m) => (
                <button key={m} onClick={() => setModality(m)}
                  className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${
                    modality === m ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white" : "border-border bg-card text-muted-foreground"
                  }`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2 pb-2">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Cidade</p>
              <div className="-mx-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-2 px-1">
                  {cities.map((c) => (
                    <button key={c} onClick={() => { setCidade(c); setBairro("Todos"); }}
                      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${
                        cidade === c ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white" : "border-border bg-card text-muted-foreground"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">Bairro / Região</p>
              <div className="-mx-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-2 px-1">
                  {neighborhoods.map((b) => (
                    <button key={b} onClick={() => setBairro(b)}
                      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium ${
                        bairro === b ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-white" : "border-border bg-card text-muted-foreground"
                      }`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-3 space-y-3">
          {ranked.map((t, i) => {
            const top3 = i < 3;
            const { bairro: b } = splitRegion(t.region);
            return (
              <Link key={t.id} to="/trainer/$id" params={{ id: t.id }}
                className={`flex items-center gap-3 rounded-2xl p-3 shadow-[var(--shadow-soft)] transition-transform active:scale-[0.98] ${
                  top3 ? "bg-gradient-to-br from-[var(--brand-yellow)]/40 to-card border border-[var(--brand-yellow)]" : "bg-card"
                }`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold ${top3 ? "bg-[var(--brand-yellow)] text-[var(--brand-black)]" : "bg-muted"}`}>
                  {medal(i)}
                </div>
                <img src={t.photo} alt="" className="h-14 w-14 shrink-0 rounded-xl bg-muted object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold">{t.name}</p>
                    {t.boosted && (
                      <span className="rounded-full bg-[var(--brand-black)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--brand-yellow)]">
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{t.specialties.join(" · ")}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 font-medium">
                      <Star className="h-3.5 w-3.5 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
                      {t.rating}
                    </span>
                    <span className="text-muted-foreground">{t.completedSessions ?? 0} sessões</span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {b}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
          {ranked.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {mode === "neighborhood" ? "Nenhum profissional para esse bairro." : "Nenhum profissional para essa modalidade."}
            </p>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
