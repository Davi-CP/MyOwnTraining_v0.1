import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { TERMS_TEXT } from "@/lib/legal-content";

export const Route = createFileRoute("/client/terms")({
  component: ClientTerms,
  head: () => ({ meta: [{ title: "Termos de uso — MyOwnTraining" }] }),
});

function ClientTerms() {
  return (
    <LegalPage title="Termos de uso" accountType="client" backTo="/client/security" kind="terms">
      {TERMS_TEXT}
    </LegalPage>
  );
}
