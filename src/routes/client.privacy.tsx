import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../shared/components/legal-page";

export const Route = createFileRoute("/client/privacy")({
  component: ClientPrivacyPage,
  head: () => ({ meta: [{ title: "MyOwnTraining — Privacidade do Cliente" }] }),
});

function ClientPrivacyPage() {
  return (
    <LegalPage title="Política de Privacidade" backTo="/" legalVersion="2026.08">
      MyOwnTraining — Política de Privacidade

      Coletamos apenas os dados necessários para cadastro, busca, agendamento, pagamento e suporte.

      - nome e e-mail
      - histórico de treinos
      - preferências e consentimentos
      - registros de segurança e auditoria
    </LegalPage>
  );
}
