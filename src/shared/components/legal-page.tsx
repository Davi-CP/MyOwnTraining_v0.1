import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "./button";

type Props = {
  title: string;
  backTo: string;
  children: ReactNode;
  legalVersion: string;
};

export function LegalPage({ title, backTo, children, legalVersion }: Props) {
  const navigate = useNavigate();
  const [confirmRefuse, setConfirmRefuse] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="mb-4 flex items-center gap-3">
          <Link to={backTo} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="flex-1 text-xl font-bold">{title}</h1>
          <FileText className="h-5 w-5 text-muted-foreground" />
        </div>

        <p className="mb-3 text-[11px] text-muted-foreground">Versão {legalVersion}</p>

        <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap rounded-2xl bg-card p-5 text-left text-sm leading-relaxed shadow-[var(--shadow-soft)]">
          {children}
        </div>

        <div className="mt-5 flex gap-2">
          <Button variant="outline" onClick={() => setConfirmRefuse(true)} className="h-12 flex-1 rounded-xl">
            Recusar
          </Button>
          <Button onClick={() => navigate({ to: backTo })} className="h-12 flex-1 rounded-xl bg-[var(--brand-yellow)] font-semibold text-[var(--brand-black)] hover:bg-[var(--brand-yellow)]/90">
            Aceitar
          </Button>
        </div>
      </div>

      {confirmRefuse ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setConfirmRefuse(false)}>
          <div onClick={(event) => event.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-background p-5 pb-8 shadow-[var(--shadow-soft)]">
            <h2 className="text-lg font-bold">Confirmar recusa?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Você será redirecionado para a tela inicial.
            </p>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="h-12 flex-1 rounded-xl" onClick={() => setConfirmRefuse(false)}>
                Voltar
              </Button>
              <Button
                variant="destructive"
                className="h-12 flex-1 rounded-xl"
                onClick={() => navigate({ to: "/" })}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
