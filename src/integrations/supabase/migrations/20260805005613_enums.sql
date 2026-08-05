-- ============================================================
-- Migration: enums
-- Sistema de Personal Trainers
-- ============================================================
-- Precisa rodar antes de qualquer tabela que use estes tipos.
--
-- IMPORTANTE: vários enums abaixo não tinham lista de valores explícita
-- no ERD original (status de agendamento, tipo/status de transação, tipo
-- de notificação, categoria/prioridade/status de chamado, status de
-- recompensa). Foram adotados valores de negócio razoáveis — revise antes
-- de aplicar em produção. Os únicos com valores explícitos no ERD são
-- papel_usuario e status_documento_cref.
-- ============================================================

-- papel_usuario: papéis de autorização (valores explícitos do ERD)
create type papel_usuario as enum ('admin', 'suporte', 'financeiro', 'usuario');

-- status_documento_cref: estado da análise do documento CREF (valores explícitos do ERD)
create type status_documento_cref as enum ('pendente', 'aprovado', 'rejeitado');

-- status_agendamento: estado do agendamento (não listado no ERD — assumido)
create type status_agendamento as enum ('pendente', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'nao_compareceu');

-- tipo_transacao: natureza da movimentação financeira (assumido)
create type tipo_transacao as enum ('credito', 'debito', 'estorno', 'pagamento', 'saque');

-- status_transacao: estado da transação financeira (assumido)
create type status_transacao as enum ('pendente', 'concluida', 'cancelada', 'falhou');

-- tipo_notificacao: categoria da notificação (assumido, com base nos exemplos citados no ERD)
create type tipo_notificacao as enum ('agendamento', 'pagamento', 'suporte', 'promocao', 'sistema');

-- categoria_chamado: assunto do chamado de suporte (assumido)
create type categoria_chamado as enum ('financeiro', 'agendamento', 'tecnico', 'conta', 'outro');

-- prioridade_chamado: prioridade de atendimento (assumido)
create type prioridade_chamado as enum ('baixa', 'media', 'alta', 'urgente');

-- status_chamado: estado do chamado de suporte (assumido)
create type status_chamado as enum ('aberto', 'em_andamento', 'aguardando_cliente', 'resolvido', 'fechado');

-- status_recompensa: estado da recompensa de indicação (assumido)
create type status_recompensa as enum ('pendente', 'liberada', 'cancelada');