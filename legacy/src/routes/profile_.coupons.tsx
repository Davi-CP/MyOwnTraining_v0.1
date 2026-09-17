import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Tag, Check, X, Gift, Copy, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { COUPONS, KEYS, useStored, generateReferralCode, type ReferralCode, type ReferralReward } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/profile_/coupons")({
  component: Coupons,
  head: () => ({ meta: [{ title: "Cupons — MyOwnTraining" }] }),
});

function Coupons() {
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [referral, setReferral] = useStored<ReferralCode | null>(KEYS.referralCodes, null);
  const [, setRewards] = useStored<ReferralReward[]>(KEYS.referralRewards, []);

  useEffect(() => {
    if (!referral) {
      setReferral({ userId: "me-client", code: generateReferralCode("CLI"), createdAt: Date.now() });
    }
  }, [referral, setReferral]);

  const apply = () => {
    const c = code.trim().toUpperCase();
    if (!c) { setFeedback({ ok: false, msg: "Digite um código." }); return; }
    const discount = COUPONS[c];
    if (discount) setFeedback({ ok: true, msg: `Cupom válido! ${discount}% de desconto será aplicado no próximo treino.` });
    else setFeedback({ ok: false, msg: "Cupom inválido ou expirado." });
  };

  const inviteUrl = referral ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${referral.code}` : "";
  const inviteMsg = `Junte-se ao MyOwnTraining! Use meu código ${referral?.code ?? ""} e ganhe desconto no primeiro treino: ${inviteUrl}`;
  const registerReward = () => {
    if (!referral) return;
    setRewards((prev) => [...prev, { id: `rw-${Date.now()}`, referrerId: referral.userId, status: "pending", credit: 20, createdAt: Date.now() }]);
  };
  const copy = () => { navigator.clipboard.writeText(inviteUrl); toast.success("Link copiado"); registerReward(); };
  const share = (kind: "whatsapp" | "instagram" | "sms") => {
    const url =
      kind === "whatsapp" ? `https://wa.me/?text=${encodeURIComponent(inviteMsg)}` :
      kind === "sms" ? `sms:?body=${encodeURIComponent(inviteMsg)}` :
      `https://www.instagram.com/`;
    window.open(url, "_blank");
    if (kind === "instagram") navigator.clipboard.writeText(inviteMsg);
    registerReward();
  };

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/profile" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Cupons</h1>
        </div>

        <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Código do cupom</span>
            <div className="relative">
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setFeedback(null); }}
                placeholder="EX: PRIMEIRO10"
                className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm uppercase tracking-wide outline-none focus:border-[var(--brand-yellow)]"
              />
            </div>
          </label>

          <Button onClick={apply}
            className="mt-3 h-12 w-full rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
            Aplicar cupom
          </Button>

          {feedback && (
            <div className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-xs ${
              feedback.ok ? "bg-green-50 text-green-700" : "bg-destructive/10 text-destructive"
            }`}>
              {feedback.ok ? <Check className="mt-0.5 h-4 w-4" /> : <X className="mt-0.5 h-4 w-4" />}
              <span>{feedback.msg}</span>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Códigos de teste: <b>PRIMEIRO10</b>, <b>TREINO20</b>, <b>MOT15</b>.
        </p>

        <div className="mt-6 rounded-2xl bg-[var(--brand-yellow)]/20 p-4 shadow-[var(--shadow-soft)]">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Gift className="h-4 w-4" /> Convide amigos</h2>
          <p className="mt-1 text-xs text-muted-foreground">Ganhe R$20 em créditos e seu amigo recebe desconto no primeiro treino.</p>
          <div className="mt-3 rounded-xl bg-background p-3">
            <p className="text-[10px] uppercase text-muted-foreground">Seu código</p>
            <p className="font-mono text-base font-bold">{referral?.code ?? "—"}</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button onClick={copy} variant="outline" className="h-10 rounded-xl text-xs"><Copy className="mr-1 h-3.5 w-3.5" /> Copiar link</Button>
            <Button onClick={() => share("whatsapp")} variant="outline" className="h-10 rounded-xl text-xs"><Share2 className="mr-1 h-3.5 w-3.5" /> WhatsApp</Button>
            <Button onClick={() => share("instagram")} variant="outline" className="h-10 rounded-xl text-xs"><Share2 className="mr-1 h-3.5 w-3.5" /> Instagram</Button>
            <Button onClick={() => share("sms")} variant="outline" className="h-10 rounded-xl text-xs"><Share2 className="mr-1 h-3.5 w-3.5" /> SMS</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

