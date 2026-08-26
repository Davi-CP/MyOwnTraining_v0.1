import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Wallet, Clock, Calendar, Plus, X, Star, Gift, TrendingUp, ScanFace, Check } from "lucide-react";
import { useState } from "react";
import { ProBottomNav } from "@/components/ProBottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useStored,
  KEYS,
  DEFAULT_WALLET,
  DEFAULT_WALLET_TX,
  DEFAULT_TRAINER_LOYALTY,
  pushNotification,
  type WalletState,
  type WalletTx,
  type PixKey,
  type PixKeyType,
  type TrainerLoyalty,
  type FaceProfile,
  type FaceLog,
} from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/pro/wallet")({
  component: WalletPage,
  head: () => ({ meta: [{ title: "Carteira — MyOwnTraining" }] }),
});

const PIX_LABELS: Record<PixKeyType, string> = {
  cpf: "CPF",
  email: "Email",
  telefone: "Telefone",
  aleatoria: "Aleatória",
};

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function WalletPage() {
  const [wallet, setWallet] = useStored<WalletState>(KEYS.wallet, DEFAULT_WALLET);
  const [tx, setTx] = useStored<WalletTx[]>(KEYS.walletTx, DEFAULT_WALLET_TX);
  const [pixKeys, setPixKeys] = useStored<PixKey[]>(KEYS.pixKeys, []);
  const [loyalty] = useStored<TrainerLoyalty>(KEYS.trainerLoyalty, DEFAULT_TRAINER_LOYALTY);
  const [faceProfile, setFaceProfile] = useStored<FaceProfile | null>(KEYS.faceProfile, null);
  const [faceLogs, setFaceLogs] = useStored<FaceLog[]>(KEYS.faceLogs, []);
  const [open, setOpen] = useState(false);
  const [pixOpen, setPixOpen] = useState(false);
  const [faceOpen, setFaceOpen] = useState<{ amount: number; key: PixKey } | null>(null);

  const LOYALTY_GOAL = 7;
  const remaining = Math.max(0, LOYALTY_GOAL - loyalty.completedCount);
  const monthEarnings = tx.filter((t) => t.type === "receive").reduce((s, t) => s + t.value, 0);

  const months = [120, 240, 180, 320, 410, 430];
  const max = Math.max(...months);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md">
        <header className="bg-[var(--brand-black)] px-5 pt-8 pb-16 text-white">
          <div className="mb-6 flex items-center gap-3">
            <Link to="/pro/dashboard" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="flex-1 text-lg font-semibold">Carteira</h1>
            <Wallet className="h-5 w-5 opacity-70" />
          </div>
          <p className="text-sm opacity-70">Saldo disponível</p>
          <p className="text-4xl font-bold">{brl(wallet.available)}</p>
          <Button
            onClick={() => setOpen(true)}
            className="mt-4 h-11 rounded-xl bg-[var(--brand-yellow)] px-6 font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90"
          >
            Sacar via PIX
          </Button>
        </header>

        <div className="-mt-10 grid grid-cols-2 gap-2 px-5">
          {[
            { l: "Pendente", v: brl(wallet.pending), i: Clock },
            { l: "Ganhos do mês", v: brl(monthEarnings), i: TrendingUp },
            { l: "Total sacado", v: brl(wallet.withdrawnThisMonth), i: ArrowUpRight },
            { l: "Próx. pagamento", v: wallet.nextPayoutDate, i: Calendar },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl bg-card p-3 text-center shadow-[var(--shadow-soft)]">
              <s.i className="mx-auto h-4 w-4 text-muted-foreground" />
              <p className="mt-1 text-sm font-bold">{s.v}</p>
              <p className="text-[10px] text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>

        <section className="mt-6 px-5">
          <div className="rounded-2xl bg-[var(--brand-yellow)]/20 p-4 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-[var(--brand-black)]" />
              <p className="text-sm font-semibold">Programa de fidelidade</p>
            </div>
            {remaining > 0 ? (
              <>
                <p className="mt-1 text-sm">Faltam <span className="font-bold">{remaining} treinos</span> para taxa reduzida de 7%</p>
                <div className="mt-2 h-2 rounded-full bg-white/60">
                  <div className="h-full rounded-full bg-[var(--brand-black)]" style={{ width: `${(loyalty.completedCount / LOYALTY_GOAL) * 100}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">{loyalty.completedCount} / {LOYALTY_GOAL} treinos concluídos</p>
              </>
            ) : (
              <p className="mt-1 text-sm font-semibold">Recompensa liberada! Taxa reduzida de 7% ativa.</p>
            )}
          </div>
        </section>

        <section className="mt-6 px-5">
          <h2 className="mb-3 text-base font-semibold">Ganhos mensais</h2>
          <div className="rounded-2xl bg-card p-4 shadow-[var(--shadow-soft)]">
            <div className="flex h-28 items-end gap-2">
              {months.map((v, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex w-full flex-1 items-end">
                    <div className="w-full rounded-t-md bg-[var(--brand-yellow)]" style={{ height: `${(v / max) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{["Dez", "Jan", "Fev", "Mar", "Abr", "Mai"][i]}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Melhor mês: <span className="font-semibold text-foreground">Mai · {brl(430 * 10)}</span></p>
          </div>
        </section>

        <section className="mt-6 px-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Chaves PIX</h2>
            <button onClick={() => setPixOpen(true)} className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Plus className="h-3 w-3" /> Adicionar
            </button>
          </div>
          {pixKeys.length === 0 && (
            <p className="rounded-2xl bg-card p-3 text-center text-xs text-muted-foreground shadow-[var(--shadow-soft)]">
              Nenhuma chave cadastrada.
            </p>
          )}
          <div className="space-y-2">
            {pixKeys.map((k) => (
              <div key={k.id} className="flex items-center gap-2 rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{PIX_LABELS[k.type]}</p>
                  <p className="text-sm font-semibold">{k.value}</p>
                </div>
                <button
                  onClick={() => setPixKeys(pixKeys.map((x) => ({ ...x, favorite: x.id === k.id })))}
                  className={k.favorite ? "text-[var(--brand-yellow)]" : "text-muted-foreground"}
                  aria-label="Favoritar"
                >
                  <Star className={`h-4 w-4 ${k.favorite ? "fill-[var(--brand-yellow)]" : ""}`} />
                </button>
                <button onClick={() => setPixKeys(pixKeys.filter((x) => x.id !== k.id))} className="text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 px-5">
          <h2 className="mb-3 text-base font-semibold">Transações</h2>
          {tx.length === 0 && (
            <p className="rounded-2xl bg-card p-4 text-center text-xs text-muted-foreground shadow-[var(--shadow-soft)]">
              Nenhuma transação ainda.
            </p>
          )}
          <div className="space-y-2">
            {tx.map((t) => {
              const negative = t.type === "withdraw" || t.type === "fee" || t.type === "refund" || t.type === "boost";
              const label =
                t.type === "withdraw" ? "Saque" :
                t.type === "receive" ? "Recebimento" :
                t.type === "fee" ? "Taxa" :
                t.type === "refund" ? "Reembolso" : "Boost";
              return (
                <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-[var(--shadow-soft)]">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full ${negative ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {negative ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{t.description}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(t.date).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${negative ? "text-red-600" : "text-green-600"}`}>
                      {negative ? "-" : "+"}{brl(t.value)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {t.status === "completed" ? "Concluído" : t.status === "pending" ? "Pendente" : "Falhou"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

      <WithdrawModal
        open={open}
        onClose={() => setOpen(false)}
        available={wallet.available}
        pixKeys={pixKeys}
        onConfirm={(amount, key) => {
          if (amount < 20) { toast.error("Saque mínimo: R$ 20,00"); return; }
          if (amount > wallet.available) { toast.error("Valor maior que o saldo disponível"); return; }
          setOpen(false);
          setFaceOpen({ amount, key });
        }}
      />

      <FaceVerifyModal
        open={!!faceOpen}
        hasProfile={!!faceProfile}
        onClose={() => setFaceOpen(null)}
        onSuccess={(selfieDataUrl) => {
          if (!faceOpen) return;
          const { amount, key } = faceOpen;
          if (!faceProfile) {
            setFaceProfile({ userId: "me-pro", selfieDataUrl, createdAt: Date.now() });
          }
          setFaceLogs([{ id: `fl-${Date.now()}`, userId: "me-pro", success: true, date: Date.now() }, ...faceLogs]);
          setWallet({
            ...wallet,
            available: wallet.available - amount,
            withdrawnThisMonth: wallet.withdrawnThisMonth + amount,
          });
          setTx([
            { id: `tx-${Date.now()}`, type: "withdraw", value: amount, date: Date.now(), status: "completed", description: `PIX ${PIX_LABELS[key.type]} · ${key.value}` },
            ...tx,
          ]);
          pushNotification({ audience: "trainer", title: "Saque realizado", body: `${brl(amount)} enviados para sua chave PIX após verificação facial.` });
          toast.success("Verificação facial OK · saque solicitado");
          setFaceOpen(null);
        }}
      />


      <AddPixModal
        open={pixOpen}
        onClose={() => setPixOpen(false)}
        onAdd={(type, value) => {
          setPixKeys([...pixKeys, { id: `pix-${Date.now()}`, type, value, favorite: pixKeys.length === 0 }]);
          toast.success("Chave PIX adicionada");
          setPixOpen(false);
        }}
      />

      <ProBottomNav />
    </div>
  );
}

function WithdrawModal({
  open, onClose, available, pixKeys, onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  available: number;
  pixKeys: PixKey[];
  onConfirm: (amount: number, key: PixKey) => void;
}) {
  const fav = pixKeys.find((k) => k.favorite) ?? pixKeys[0];
  const [amount, setAmount] = useState("");
  const [keyId, setKeyId] = useState(fav?.id ?? "");
  if (!open) return null;
  const key = pixKeys.find((k) => k.id === keyId) ?? fav;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-background p-5 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Sacar via PIX</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">Disponível: <span className="font-semibold text-foreground">{brl(available)}</span></p>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Valor do saque</span>
          <Input type="number" min="20" step="0.01" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-11 rounded-xl" />
          <p className="mt-1 text-[11px] text-muted-foreground">Mínimo R$ 20,00</p>
        </label>
        <label className="mb-5 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chave PIX</span>
          {pixKeys.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              Cadastre uma chave PIX antes de sacar.
            </p>
          ) : (
            <select value={keyId} onChange={(e) => setKeyId(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm">
              {pixKeys.map((k) => (
                <option key={k.id} value={k.id}>{PIX_LABELS[k.type]} · {k.value}</option>
              ))}
            </select>
          )}
        </label>
        <Button
          disabled={!key || !amount}
          onClick={() => key && onConfirm(Number(amount), key)}
          className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90"
        >
          Confirmar saque
        </Button>
      </div>
    </div>
  );
}

function AddPixModal({
  open, onClose, onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (type: PixKeyType, value: string) => void;
}) {
  const [type, setType] = useState<PixKeyType>("cpf");
  const [value, setValue] = useState("");
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-background p-5 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Nova chave PIX</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tipo</span>
          <select value={type} onChange={(e) => setType(e.target.value as PixKeyType)} className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm">
            <option value="cpf">CPF</option>
            <option value="email">Email</option>
            <option value="telefone">Telefone</option>
            <option value="aleatoria">Aleatória</option>
          </select>
        </label>
        <label className="mb-5 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chave</span>
          <Input value={value} onChange={(e) => setValue(e.target.value)} className="h-11 rounded-xl" />
        </label>
        <Button
          disabled={!value.trim()}
          onClick={() => onAdd(type, value.trim())}
          className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90"
        >
          Adicionar chave
        </Button>
      </div>
    </div>
  );
}

function FaceVerifyModal({
  open, hasProfile, onClose, onSuccess,
}: {
  open: boolean;
  hasProfile: boolean;
  onClose: () => void;
  onSuccess: (selfieDataUrl: string) => void;
}) {
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);
  if (!open) return null;
  const startScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setDone(true);
      setTimeout(() => {
        // 1x1 transparent PNG as placeholder selfie
        const selfie = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        onSuccess(selfie);
        setDone(false);
      }, 600);
    }, 1500);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-background p-5 pb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Verificação facial</h2>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          {hasProfile
            ? "Confirme sua identidade com reconhecimento facial para liberar o saque."
            : "Primeiro saque: vamos cadastrar seu rosto para validar futuras transações."}
        </p>
        <div className="mb-5 flex aspect-square items-center justify-center rounded-3xl border-2 border-dashed border-border bg-muted/40">
          {done ? (
            <div className="flex flex-col items-center gap-2 text-green-600">
              <Check className="h-14 w-14" />
              <p className="text-sm font-semibold">Identidade confirmada</p>
            </div>
          ) : scanning ? (
            <div className="flex flex-col items-center gap-2">
              <ScanFace className="h-16 w-16 animate-pulse text-[var(--brand-yellow)]" />
              <p className="text-sm font-semibold">Analisando rosto...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ScanFace className="h-16 w-16" />
              <p className="text-xs">Posicione o rosto no centro</p>
            </div>
          )}
        </div>
        <Button
          disabled={scanning || done}
          onClick={startScan}
          className="h-12 w-full rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90"
        >
          {hasProfile ? "Iniciar verificação" : "Cadastrar e verificar"}
        </Button>
      </div>
    </div>
  );
}
