import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../shared/components/legal-page";

export const Route = createFileRoute("/pro/terms")({
  component: ProTermsPage,
  head: () => ({ meta: [{ title: "MyOwnTraining — Termos do PT" }] }),
});

function ProTermsPage() {
  return (
    <LegalPage title="Termos de Uso do PT" backTo="/pro/dashboard" legalVersion="2026.08">
      MyOwnTraining — Termos de Uso para Profissionais

      Ao continuar, você confirma que leu e aceitou as regras aplicáveis ao perfil profissional.
    </LegalPage>
  );
}
