import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  useStored, KEYS, LEGAL_VERSION,
  type LegalAcceptanceMap, type AccountType,
} from "@/lib/storage";
import { toast } from "sonner";

type Props = {
  title: string;
  accountType: AccountType;
  backTo: string;
  kind: "terms" | "privacy";
  children: ReactNode;
};

export function LegalPage({ title, accountType, backTo, kind, children }: Props) {
  const navigate = useNavigate();
  const storageKey = kind === "terms" ? KEYS.termsAcceptance : KEYS.privacyAcceptance;
  const [map, setMap] = useStored<LegalAcceptanceMap>(storageKey, {});
  const [privacyMap] = useStored<LegalAcceptanceMap>(KEYS.privacyAcceptance, {});
  const [blocked, setBlocked] = useStored<Record<string, boolean>>(KEYS.blockedAccounts, {});
  const [refuseOpen, setRefuseOpen] = useState(false);
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOnboarding(new URLSearchParams(window.location.search).has("onboarding"));
    }
  }, []);

  const userId = accountType === "pro" ? "pro-me" : "client-me";
  const current = map[userId];
  const homeRoute = accountType === "pro" ? "/pro/dashboard" : "/home";

  const accept = () => {
    setMap({
      ...map,
      [userId]: {
        accepted: true,
        accepted_at: Date.now(),
        version: LEGAL_VERSION,
        account_type: accountType,
        user_id: userId,
      },
    });
    if (blocked[userId]) {
      const next = { ...blocked }; delete next[userId]; setBlocked(next);
    }
    toast.success(kind === "terms" ? "Termos aceitos" : "Política aceita");

    if (onboarding) {
      if (kind === "terms") {
        const privacyOk = privacyMap[userId]?.accepted && privacyMap[userId]?.version === LEGAL_VERSION;
        const next = privacyOk
          ? homeRoute
          : `/${accountType}/privacy?onboarding=1`;
        setTimeout(() => navigate({ to: next }), 400);
      } else {
        setTimeout(() => navigate({ to: homeRoute }), 400);
      }
      return;
    }
    setTimeout(() => navigate({ to: backTo }), 500);
  };

  const confirmRefuse = () => {
    setMap({
      ...map,
      [userId]: {
        accepted: false,
        accepted_at: Date.now(),
        version: LEGAL_VERSION,
        account_type: accountType,
        user_id: userId,
      },
    });
    setBlocked({ ...blocked, [userId]: true });
    toast(
      kind === "terms"
        ? "Acesso bloqueado — aceite os Termos para continuar"
        : "Acesso bloqueado — aceite a Política de Privacidade para continuar",
      { duration: 3500 },
    );
    setRefuseOpen(false);
    setTimeout(() => navigate({ to: "/" }), 800);
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          {!onboarding && (
            <Link to={backTo} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <h1 className="flex-1 text-xl font-bold">{title}</h1>
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>

        <p className="mb-3 text-[11px] text-muted-foreground">
          Versão {LEGAL_VERSION}
          {current?.accepted && current.accepted_at &&
            ` · aceito em ${new Date(current.accepted_at).toLocaleDateString("pt-BR")}`}
        </p>

        <div className="max-h-[60vh] overflow-y-auto rounded-2xl bg-card p-5 text-sm leading-relaxed shadow-[var(--shadow-soft)] whitespace-pre-wrap">
          {children}
        </div>

        <div className="mt-5 flex gap-2">
          <Button variant="outline" onClick={() => setRefuseOpen(true)} className="flex-1 h-12 rounded-xl">
            Recusar
          </Button>
          <Button onClick={accept} className="flex-1 h-12 rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
            Aceitar
          </Button>
        </div>
      </div>

      <Dialog open={refuseOpen} onOpenChange={setRefuseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{kind === "terms" ? "Recusar Termos de Uso?" : "Recusar Política de Privacidade?"}</DialogTitle>
            <DialogDescription>
              {kind === "terms"
                ? "Você não poderá utilizar a plataforma caso recuse os Termos de Uso. Deseja continuar?"
                : "Você não poderá utilizar a plataforma caso recuse a Política de Privacidade. Deseja continuar?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefuseOpen(false)}>Voltar</Button>
            <Button variant="destructive" onClick={confirmRefuse}>Confirmar recusa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
