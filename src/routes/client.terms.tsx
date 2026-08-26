import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "../shared/components/legal-page";

export const Route = createFileRoute("/client/terms")({
  component: ClientTermsPage,
  head: () => ({ meta: [{ title: "MyOwnTraining — Termos do Cliente" }] }),
});

function ClientTermsPage() {
  return (
    <LegalPage title="Termos de Uso" backTo="/" legalVersion="2026.08">
      MyOwnTraining — Termos de Uso

      Ao continuar, você confirma que leu e aceitou os termos da plataforma para clientes.

      - uso responsável da conta
      - respeito aos profissionais
      - cumprimento das regras de agendamento e cancelamento
      - proteção dos seus dados pessoais
    </LegalPage>
  );
}
