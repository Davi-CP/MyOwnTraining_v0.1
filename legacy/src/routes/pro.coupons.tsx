import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Tag, Check, X, CreditCard, Gift, Copy, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ProBottomNav } from "@/components/ProBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  COUPONS, KEYS, useStored, DEFAULT_RECHARGE_CARDS, DEFAULT_WALLET,
  generateReferralCode, pushNotification,
  type RechargeCard, type ReferralCode, type ReferralReward, type WalletState, type WalletTx,
} from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/coupons")({
  component: ProCoupons,
  head: () => ({ meta: [{ title: "Cupons — MyOwnTraining" }] }),
});

function ProCoupons() {
  const [code, setCode] = useState("");
  const [cardCode, setCardCode] = useState("");
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);
  const [cards, setCards] = useStored<RechargeCard[]>(KEYS.rechargeCards, DEFAULT_RECHARGE_CARDS);
  const [redeemed, setRedeemed] = useStored<string[]>(KEYS.redeemedCards, []);
  const [wallet, setWallet] = useStored<WalletState>(KEYS.wallet, DEFAULT_WALLET);
  const [tx, setTx] = useStored<WalletTx[]>(KEYS.walletTx, []);
  const [referral, setReferral] = useStored<ReferralCode | null>(KEYS.referralCodes, null);
  const [, setRewards] = useStored<ReferralReward[]>(KEYS.referralRewards, []);

  useEffect(() => {
    if (!referral) {
      setReferral({ userId: "me-pro", code: generateReferralCode("PRO"), createdAt: Date.now() });
    }
  }, [referral, setReferral]);

  const applyCoupon = () => {
    const c = code.trim().toUpperCase();
    if (!c) { setFeedback({ ok: false, msg: "Digite um código." }); return; }
    if (COUPONS[c]) setFeedback({ ok: true, msg: `Cupom válido! ${COUPONS[c]}% de desconto liberado.` });
    else setFeedback({ ok: false, msg: "Cupom inválido ou expirado." });
  };

  const redeem = () => {
    const c = cardCode.trim().toUpperCase();
    const card = cards.find((x) => x.code === c);
    if (!card) { toast.error("Código inválido"); return; }
    if (!card.active) { toast.error("Cartão inativo"); return; }
    if (redeemed.includes(c)) { toast.error("Cartão já utilizado"); return; }
    if (new Date(card.expiration).getTime() < Date.now()) { toast.error("Cartão expirado"); return; }
    setRedeemed([...redeemed, c]);
    setWallet({ ...wallet, available: wallet.available + card.value });
    setTx([
      { id: `tx-${Date.now()}`, type: "receive", value: card.value, date: Date.now(), status: "completed", description: `Cartão recarga ${c}` },
      ...tx,
    ]);
    pushNotification({ audience: "trainer", title: "Recarga aplicada", body: `R$ ${card.value.toFixed(2)} adicionados ao saldo.` });
    toast.success(`R$ ${card.value.toFixed(2)} adicionados ao saldo`);
    setCardCode("");
  };

  const inviteUrl = referral ? `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${referral.code}` : "";
  const inviteMsg = `Junte-se ao MyOwnTraining! Use meu código ${referral?.code ?? ""} e ganhe desconto: ${inviteUrl}`;

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
  const registerReward = () => {
    if (!referral) return;
    setRewards((prev) => [
      ...prev,
      { id: `rw-${Date.now()}`, referrerId: referral.userId, status: "pending", credit: 20, createdAt: Date.now() },
    ]);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to="/pro/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold">Cupons</h1>
        </div>

        <section className="mb-5 rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Tag className="h-4 w-4" /> Código promocional</h2>
          <div className="relative">
            <Input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setFeedback(null); }}
              placeholder="EX: PRIMEIRO10" className="h-11 rounded-xl uppercase" />
          </div>
          <Button onClick={applyCoupon} className="mt-3 h-11 w-full rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
            Aplicar cupom
          </Button>
          {feedback && (
            <div className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-xs ${feedback.ok ? "bg-green-50 text-green-700" : "bg-destructive/10 text-destructive"}`}>
              {feedback.ok ? <Check className="mt-0.5 h-4 w-4" /> : <X className="mt-0.5 h-4 w-4" />}
              <span>{feedback.msg}</span>
            </div>
          )}
        </section>

        <section className="mb-5 rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold"><CreditCard className="h-4 w-4" /> Cartão físico de recarga</h2>
          <p className="mb-2 text-[11px] text-muted-foreground">Digite o código do cartão para adicionar saldo à sua carteira.</p>
          <Input value={cardCode} onChange={(e) => setCardCode(e.target.value.toUpperCase())}
            placeholder="MOT-2026-ABCD" className="h-11 rounded-xl uppercase" />
          <Button onClick={redeem} className="mt-3 h-11 w-full rounded-xl bg-[var(--brand-black)] font-semibold text-white hover:bg-[var(--brand-black)]/90">
            Resgatar saldo
          </Button>
          <p className="mt-2 text-[10px] text-muted-foreground">Códigos de teste: MOT-2026-ABCD (R$20), MOT-2026-EFGH (R$50), MOT-2026-IJKL (R$100).</p>
        </section>

        <section className="rounded-2xl bg-[var(--brand-yellow)]/20 p-4 shadow-[var(--shadow-soft)]">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Gift className="h-4 w-4" /> Convide Profissionais</h2>
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
        </section>

        <p className="mt-4 text-[10px] text-muted-foreground">Cartões disponíveis: {cards.filter((c) => c.active).length}.
          {" "}<button className="underline" onClick={() => setCards([...cards])}>atualizar</button>
        </p>
      </div>
      <ProBottomNav />
    </div>
  );
}
