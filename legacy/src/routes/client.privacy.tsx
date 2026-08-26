import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/client/privacy")({
  component: ClientPrivacy,
  head: () => ({ meta: [{ title: "Política de privacidade — MyOwnTraining" }] }),
});

function ClientPrivacy() {
  return (
    <LegalPage title="Política de privacidade" accountType="client" backTo="/client/security" kind="privacy">
      <p className="mb-3">Esta política descreve, em conformidade com a LGPD (Lei nº 13.709/2018), como tratamos seus dados pessoais como aluno da MyOwnTraining.</p>

      <h2 className="mb-2 text-base font-bold">1. Dados coletados</h2>
      <p className="mb-3">Coletamos dados cadastrais (nome, e-mail, telefone), de pagamento, de geolocalização, histórico de treinos e interações de suporte.</p>

      <h2 className="mb-2 text-base font-bold">2. Compartilhamento de localização</h2>
      <p className="mb-3">A localização é usada para mostrar profissionais próximos e durante treinos para segurança. Pode ser desativada nas configurações.</p>

      <h2 className="mb-2 text-base font-bold">3. Notificações</h2>
      <p className="mb-3">Enviamos notificações sobre agendamentos, pagamentos e segurança. Marketing pode ser desativado a qualquer momento.</p>

      <h2 className="mb-2 text-base font-bold">4. Processamento de pagamentos</h2>
      <p className="mb-3">Dados de pagamento são processados por parceiros financeiros certificados (PCI-DSS). Não armazenamos o número completo do seu cartão.</p>

      <h2 className="mb-2 text-base font-bold">5. Informações armazenadas</h2>
      <p className="mb-3">Mantemos seu perfil, histórico de treinos, avaliações e chamados de suporte enquanto sua conta estiver ativa.</p>

      <h2 className="mb-2 text-base font-bold">6. Histórico de treinos</h2>
      <p className="mb-3">O histórico fica disponível para consulta no app e é utilizado para recomendar profissionais e calcular benefícios do programa de fidelidade.</p>

      <h2 className="mb-2 text-base font-bold">7. Tickets de suporte</h2>
      <p className="mb-3">Conversas com o suporte são registradas para qualidade e auditoria. Anexos enviados ficam restritos à equipe responsável.</p>

      <h2 className="mb-2 text-base font-bold">8. Seus direitos (LGPD)</h2>
      <p className="mb-3">Você tem direito a acesso, correção, portabilidade, anonimização, oposição e exclusão dos seus dados, conforme a LGPD.</p>

      <h2 className="mb-2 text-base font-bold">9. Solicitação de exclusão</h2>
      <p className="mb-3">Você pode solicitar a exclusão da conta a qualquer momento em Segurança e privacidade. Dados de obrigação legal serão retidos pelo prazo exigido.</p>

      <h2 className="mb-2 text-base font-bold">10. Segurança e criptografia</h2>
      <p>Aplicamos criptografia em trânsito (TLS) e em repouso, autenticação forte e monitoramento contínuo para proteger suas informações.</p>
    </LegalPage>
  );
}
