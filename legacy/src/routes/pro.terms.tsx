import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { TERMS_TEXT } from "@/lib/legal-content";

export const Route = createFileRoute("/pro/terms")({
  component: ProTerms,
  head: () => ({ meta: [{ title: "Termos de uso — MyOwnTraining" }] }),
});

function ProTerms() {
  return (
    <LegalPage title="Termos de uso" accountType="pro" backTo="/pro/security" kind="terms">
      {TERMS_TEXT}
    </LegalPage>
  );
}
