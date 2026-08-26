import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, Clock, MapPin, MessageCircle, Star, X, Ban } from "lucide-react";
import { useState } from "react";
import { ProBottomNav } from "@/components/ProBottomNav";
import {
  useStored,
  KEYS,
  STUDENTS,
  DEFAULT_PRO_HISTORY,
  DEFAULT_TRAINER_LOYALTY,
  pushNotification,
  type ProHistoryItem,
  type StudentReview,
  type TrainerLoyalty,
  type BlockedUser,
} from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/history")({
  component: ProHistory,
  head: () => ({ meta: [{ title: "Histórico — MyOwnTraining" }] }),
});

function ProHistory() {
  const [history] = useStored<ProHistoryItem[]>(KEYS.proHistory, DEFAULT_PRO_HISTORY);
  const [reviews, setReviews] = useStored<StudentReview[]>(KEYS.proStudentReviews, []);
  const [loyalty, setLoyalty] = useStored<TrainerLoyalty>(KEYS.trainerLoyalty, DEFAULT_TRAINER_LOYALTY);
  const [blocked, setBlocked] = useStored<BlockedUser[]>(KEYS.blockedUsers, []);
  const [rateOf, setRateOf] = useState<{ id: string; name: string } | null>(null);

  const toggleBlock = (id: string, name: string) => {
    const exists = blocked.find((b) => b.targetId === id && b.blockedBy === "trainer");
    if (exists) {
      setBlocked(blocked.filter((b) => b.id !== exists.id));
      toast.success(`${name} desbloqueado`);
    } else {
      setBlocked([...blocked, { id: `bl-${Date.now()}`, blockedBy: "trainer", targetId: id, date: Date.now() }]);
      pushNotification({ audience: "trainer", title: "Aluno bloqueado", body: `${name} não poderá mais contatar você.` });
      toast.success(`${name} bloqueado`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <h1 className="mb-2 text-xl font-bold">Histórico</h1>
        <div className="mb-4 rounded-2xl bg-card p-3 text-xs shadow-[var(--shadow-soft)]">
          <p className="font-semibold">Programa de fidelidade</p>
          <p className="text-muted-foreground">{loyalty.completedCount}/7 treinos — {loyalty.pendingReducedFee ? "Próximo treino com taxa reduzida (7%)" : "A cada 7 treinos, taxa reduzida para 7%"}</p>
        </div>

        {history.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">Nenhum treino concluído ainda.</p>
        )}

        <div className="space-y-3">
          {history.map((h) => {
            const s = STUDENTS.find((x) => x.id === h.studentId);
            if (!s) return null;
            const myRating = reviews.find((r) => r.studentId === s.id);
            return (
              <div key={h.id} className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-3">
                  <img src={s.photo} alt="" className="h-12 w-12 rounded-xl bg-muted" />
                  <div className="flex-1">
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Recebido: R$ {h.value.toFixed(2)}</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Concluído</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {h.date}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {h.duration}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {h.place}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {myRating ? (
                    <div className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-muted py-2 text-xs text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" />
                      Avaliado: {myRating.rating}★
                    </div>
                  ) : (
                    <button
                      onClick={() => setRateOf({ id: s.id, name: s.name })}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--brand-yellow)] py-2 text-xs font-semibold"
                    >
                      <Star className="h-3.5 w-3.5" /> Avaliar
                    </button>
                  )}
                  <Link
                    to="/pro/chat/$id"
                    params={{ id: s.id }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2 text-xs font-medium"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Chat
                  </Link>
                  <button
                    onClick={() => toggleBlock(s.id, s.name)}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-medium ${
                      blocked.some((b) => b.targetId === s.id && b.blockedBy === "trainer")
                        ? "border-red-300 bg-red-50 text-red-600"
                        : "border-border"
                    }`}
                  >
                    <Ban className="h-3.5 w-3.5" />
                    {blocked.some((b) => b.targetId === s.id && b.blockedBy === "trainer") ? "Desbloq." : "Bloquear"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <RateStudentModal
        open={!!rateOf}
        onClose={() => setRateOf(null)}
        onSubmit={(rating, text) => {
          if (!rateOf) return;
          setReviews([
            { id: `sr-${Date.now()}`, studentId: rateOf.id, rating, text, date: "agora" },
            ...reviews,
          ]);
          const next = loyalty.completedCount + 1;
          const unlocked = next >= 7;
          setLoyalty({ completedCount: unlocked ? 0 : next, pendingReducedFee: unlocked || loyalty.pendingReducedFee });
          if (unlocked) {
            pushNotification({ audience: "trainer", title: "Recompensa desbloqueada!", body: "Próximo treino com taxa de 7% (em vez de 15%)." });
          }
          pushNotification({ audience: "trainer", title: "Avaliação recebida", body: `Você avaliou ${rateOf.name}.` });
          toast.success(`Avaliação enviada para ${rateOf.name}`);
          setRateOf(null);
        }}
        studentName={rateOf?.name ?? ""}
      />

      <ProBottomNav />
    </div>
  );
}

function RateStudentModal({
  open, onClose, onSubmit, studentName,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, text: string) => void;
  studentName: string;
}) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-background p-5 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Avaliar {studentName}</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mb-4 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setRating(n)}>
              <Star className={`h-9 w-9 ${n <= rating ? "fill-[var(--brand-yellow)] text-[var(--brand-yellow)]" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
        <label className="mb-5 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comentário (opcional)</span>
          <textarea
            value={text} onChange={(e) => setText(e.target.value)} maxLength={500} rows={4}
            placeholder="Como foi o treino com este aluno?"
            className="w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus:border-[var(--brand-yellow)]"
          />
        </label>
        <Button
          onClick={() => { onSubmit(rating, text.trim()); setText(""); setRating(5); }}
          className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90"
        >
          Enviar avaliação
        </Button>
      </div>
    </div>
  );
}
