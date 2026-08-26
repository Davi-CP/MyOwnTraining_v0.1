import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../shared/components/legal-page";

export const Route = createFileRoute("/pro/privacy")({
  component: ProPrivacyPage,
  head: () => ({ meta: [{ title: "MyOwnTraining — Privacidade do PT" }] }),
});

function ProPrivacyPage() {
  return (
    <LegalPage title="Política de Privacidade do PT" backTo="/pro/dashboard" legalVersion="2026.08">
      MyOwnTraining — Política de Privacidade para Profissionais

      Os dados profissionais, financeiros e de validação são processados conforme as permissões do papel do PT.
    </LegalPage>
  );
}
