import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";

export const Route = createFileRoute("/pro/privacy")({
  component: ProPrivacy,
  head: () => ({ meta: [{ title: "Política de privacidade — MyOwnTraining" }] }),
});

function ProPrivacy() {
  return (
    <LegalPage title="Política de privacidade" accountType="pro" backTo="/pro/security" kind="privacy">
      <p className="mb-3">Esta política descreve, em conformidade com a LGPD (Lei nº 13.709/2018), como tratamos seus dados pessoais como profissional da MyOwnTraining.</p>

      <h2 className="mb-2 text-base font-bold">1. Dados coletados</h2>
      <p className="mb-3">Coletamos dados cadastrais (nome, CPF, e-mail, telefone), profissionais (CREF, especialidades, foto), bancários (chave PIX), de geolocalização e de uso da plataforma.</p>

      <h2 className="mb-2 text-base font-bold">2. Geolocalização</h2>
      <p className="mb-3">Sua localização é utilizada para posicioná-lo no mapa de profissionais ativos e para confirmar presença em treinos. Pode ser desativada a qualquer momento.</p>

      <h2 className="mb-2 text-base font-bold">3. Informações de pagamento</h2>
      <p className="mb-3">Dados bancários e PIX são utilizados exclusivamente para repasse de valores. Não compartilhamos com terceiros que não sejam instituições financeiras parceiras.</p>

      <h2 className="mb-2 text-base font-bold">4. Notificações</h2>
      <p className="mb-3">Enviamos notificações push e e-mail relacionados a pedidos, pagamentos e segurança. Comunicações de marketing podem ser desativadas nas configurações.</p>

      <h2 className="mb-2 text-base font-bold">5. Armazenamento de documentos</h2>
      <p className="mb-3">Documentos de identificação e CREF ficam armazenados em ambiente criptografado, acessíveis apenas pela equipe de validação.</p>

      <h2 className="mb-2 text-base font-bold">6. Chat e mensagens</h2>
      <p className="mb-3">As conversas entre profissional e aluno são armazenadas para fins de suporte e segurança. Mensagens podem ser auditadas em casos de denúncia.</p>

      <h2 className="mb-2 text-base font-bold">7. Segurança</h2>
      <p className="mb-3">Aplicamos criptografia em trânsito e em repouso, controles de acesso e monitoramento contínuo para proteger suas informações.</p>

      <h2 className="mb-2 text-base font-bold">8. Seus direitos (LGPD)</h2>
      <p className="mb-3">Você pode solicitar acesso, correção, portabilidade, anonimização ou exclusão dos seus dados a qualquer momento via Suporte.</p>

      <h2 className="mb-2 text-base font-bold">9. Exclusão de conta</h2>
      <p className="mb-3">Ao excluir sua conta, removemos os dados pessoais, exceto aqueles que devemos reter por obrigação legal (fiscal, contábil) pelos prazos exigidos.</p>

      <h2 className="mb-2 text-base font-bold">10. Compartilhamento limitado</h2>
      <p>Não vendemos seus dados. Compartilhamos apenas com prestadores essenciais (processadores de pagamento, hospedagem) sob acordos de confidencialidade.</p>
    </LegalPage>
  );
}
