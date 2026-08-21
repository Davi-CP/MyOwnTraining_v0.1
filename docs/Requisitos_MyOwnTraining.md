# MyOwnTraining — Regras de Negócio, Requisitos Funcionais e Não Funcionais

Documento descritivo do sistema, extraído do código-fonte atual (rotas TanStack Start, `src/lib/storage.ts`, `src/lib/mock-data.ts`) e do schema do banco (16 tabelas no schema `public`).

Versão do documento: 1.0 — 20/08/2026
Versão legal vigente no app: **2026.08**

---

## 1. Visão geral

### 1.1 Propósito
MyOwnTraining é um marketplace mobile-first que conecta **alunos** a **personal trainers (PTs)** para treinos presenciais fora da academia (praça, condomínio, praia, casa do aluno ou studio do PT). O app cobre descoberta por geolocalização, agendamento (pontual e recorrente), pagamento, chat, avaliações, carteira financeira do PT com saque via PIX, programa de fidelidade e indicações, além de um painel administrativo interno.

### 1.2 Atores
| Ator | Descrição |
|---|---|
| **Cliente (aluno)** | Busca PTs, agenda treinos, paga, avalia, usa cupons e indicações. |
| **Profissional (PT)** | Publica perfil e CREF, define disponibilidade, aprova recorrências, recebe pagamentos, saca saldo, contrata boost. |
| **Administrador** | Valida CREF, aprova modalidades customizadas, gerencia usuários/bloqueios, atende chamados, cria outros admins, monitora inativos. |
| **Sistema** | Executa regras automáticas: conflito de agenda, multa de cancelamento, reembolso, fidelidade, notificações. |

### 1.3 Glossário
- **CREF** — registro obrigatório do profissional de educação física no Brasil; usado como critério de aprovação do PT.
- **Boost / Patrocinado** — impulsionamento pago que prioriza o PT em mapa, listas e ranking.
- **Treino em grupo** — sessão com 2 a 4 participantes, com preço multiplicado.
- **Carteira** — saldo do PT com histórico de transações e saque via PIX.
- **Cupom físico (MOT-AAAA-XXXX)** — cartão pré-pago recarregável com valor de crédito.
- **Fidelidade** — meta de 7 treinos concluídos que libera recompensa.

### 1.4 Escopo
Dentro do escopo: cadastro/autenticação, perfis, busca e mapa, agendamento, pagamento, chat, avaliações, carteira, cupons/indicações, suporte/ajuda, segurança e privacidade, ranking e painel admin.
Fora do escopo (versão atual): app nativo, gateway de pagamento real com liquidação bancária, videochamada, prescrição de treino/planilha, integração com wearables.

---

## 2. Regras de negócio (RN)

| ID | Regra | Gatilho | Detalhe |
|---|---|---|---|
| RN-01 | **Sem agendamento duplicado** | Confirmação de agendamento | Não é permitido criar duas sessões para o mesmo PT no mesmo dia/horário; conflitos são registrados e o horário é bloqueado na grade. |
| RN-02 | **Disponibilidade estrita do PT** | Seleção de horário | Só é possível agendar dentro das janelas declaradas pelo PT (ex.: `Seg–Sex 06h–11h, 17h–21h`), interpretadas por `isWithinTrainerAvailability`. Horários fora da janela ou bloqueados manualmente aparecem desabilitados e são rejeitados na validação final. |
| RN-03 | **Multa por cancelamento tardio** | Cancelamento com menos de 2h de antecedência | Taxa de **30%** do valor da sessão; o restante é reembolsado ao aluno. Registro em log de penalidade e log de reembolso. |
| RN-04 | **Cancelamento antecipado** | Cancelamento com 2h ou mais | Reembolso integral, sem penalidade. |
| RN-05 | **Treino em grupo** | Seleção de participantes | Mínimo 1, **máximo 4** participantes; valor total = preço por pessoa × quantidade. Sessões com quantidade > 1 recebem o rótulo "Treino em grupo" na agenda do PT. |
| RN-06 | **Saque mínimo** | Solicitação de saque na carteira | Valor mínimo de **R$ 20,00**, pago via chave PIX cadastrada. |
| RN-07 | **Verificação facial no saque** | Primeiro saque do PT | É obrigatório registrar um perfil facial (selfie) antes do primeiro saque; saques seguintes exigem validação facial, com log de tentativa (sucesso/falha). |
| RN-08 | **Fidelidade — meta de 7** | Conclusão de treino | A cada **7 treinos concluídos** o usuário libera recompensa (desconto para o aluno / taxa reduzida para o PT). Exibido como "Faltam X treinos para sua recompensa". **Não existe cashback.** |
| RN-09 | **CREF travado após envio** | Salvamento do perfil profissional | O campo CREF fica somente leitura após o envio; o status (pendente / aprovado / rejeitado) é definido exclusivamente pelo admin e exibido como selo no perfil. |
| RN-10 | **Modalidade customizada exige aprovação** | PT solicita nova modalidade | A modalidade só aparece em filtros, categorias e perfis públicos após aprovação do admin (`status = approved`). |
| RN-11 | **Prioridade do boost** | Ordenação de mapa, listas e ranking | PTs impulsionados aparecem **primeiro**, antes do critério de distância, com selo "Patrocinado"/"Premium". Empates são resolvidos por distância. |
| RN-12 | **Ranking segmentado** | Acesso ao ranking | Ranking calculado por modalidade e por recorte geográfico (bairro ou cidade), com destaque visual para o top 3. |
| RN-13 | **Indicação de amigos** | Convite aceito | Gera crédito de **R$ 20,00** para quem indicou; recompensa nasce `pending` e passa a `completed` quando o indicado se torna elegível. |
| RN-14 | **Cupom físico recarregável** | Resgate de código `MOT-AAAA-XXXX` | O código deve estar ativo e dentro da validade; ao resgatar, o valor entra como crédito e o código é consumido. |
| RN-15 | **Aceite legal obrigatório** | Primeiro acesso ou nova versão | Termos de Uso e Política de Privacidade da versão **2026.08** devem ser aceitos por cliente e PT antes de acessar o app. |
| RN-16 | **Recusa legal bloqueia a conta** | Usuário recusa termos/privacidade | A conta é marcada como bloqueada e a sessão é encerrada (logout). O acesso só é restaurado com o aceite. |
| RN-17 | **Registro do consentimento** | Aceite | Deve gravar `user_id`, `version`, `accepted_at` (timestamp) e `account_type`. |
| RN-18 | **Papéis em tabela separada** | Autorização | `role` nunca fica no perfil do usuário: fica em `user_roles`, consultada pela função `has_role` (SECURITY DEFINER). Admins ficam em `admin_users` com permissões granulares (suporte, financeiro, moderação, CREF, analytics). |
| RN-19 | **Bloqueio de aluno pelo PT** | Ação no histórico do PT | Aluno bloqueado não pode abrir novos agendamentos nem conversas com aquele PT. |
| RN-20 | **Recorrência com aprovação manual** | Solicitação de treino recorrente | O PT precisa aprovar ou recusar cada solicitação; a aprovação só é permitida se não houver conflito com a agenda existente (RN-01/RN-02). |
| RN-21 | **Favoritos inteligentes** | PT favoritado abre agenda / entra em boost / muda preço | Gera notificação para o aluno que favoritou. |
| RN-22 | **Monitoramento de inatividade** | Painel admin | Usuários sem login por período prolongado entram na lista de inativos, com ações de reengajar, gerar cupom ou bloquear. |
| RN-23 | **Exclusão de conta é permanente** | Solicitação na área de segurança | Exige confirmação por senha e aviso explícito e irreversível antes da execução. |
| RN-24 | **PAR-Q antes do treino** | Primeiro agendamento | Questionário de prontidão para atividade física deve ser respondido pelo aluno. |

---

## 3. Requisitos funcionais (RF)

### 3.1 Autenticação e cadastro
| ID | Requisito | Ator | Critério de aceite |
|---|---|---|---|
| RF-01 | Login por e-mail e senha | Cliente, PT | Credenciais válidas iniciam sessão e redirecionam conforme o papel. |
| RF-02 | Login com Google | Cliente, PT | OAuth retorna à origem da aplicação e cria/associa o perfil. |
| RF-03 | Cadastro de cliente | Cliente | Cria conta com `role=client`, perfil de cliente e carteira. |
| RF-04 | Cadastro de profissional | PT | Coleta dados profissionais (CREF, formação, especialidades, locais, disponibilidade, preço, mídias) e cria perfil `pro`. |
| RF-05 | Recuperação e redefinição de senha | Cliente, PT | E-mail de recuperação enviado; link redefine a senha. |
| RF-06 | Aceite de Termos/Privacidade no onboarding | Cliente, PT | Bloqueia navegação até o aceite (RN-15 a RN-17). |
| RF-07 | Logout | Todos | Encerra sessão e retorna à tela de login. |

### 3.2 Perfil do cliente
| ID | Requisito | Critério de aceite |
|---|---|---|
| RF-08 | Visualizar perfil com métricas | Exibe Treinos, **Concluídos** e nota do aluno. |
| RF-09 | Editar dados pessoais | Alterações persistem e refletem no cabeçalho do perfil. |
| RF-10 | Histórico de treinos | Lista sessões passadas com status e valor. |
| RF-11 | Treinos recorrentes | Lista e gerencia recorrências do aluno. |
| RF-12 | Meios de pagamento | Cadastra/remove formas de pagamento. |
| RF-13 | Cupons e indicações | Mostra código próprio, créditos e resgate de cartão físico. |

### 3.3 Perfil do profissional
| ID | Requisito | Critério de aceite |
|---|---|---|
| RF-14 | Editar perfil profissional | Nome, formação, descrição, locais, disponibilidade, preço. |
| RF-15 | CREF com status | Campo travado após envio e selo de validação (RN-09). |
| RF-16 | Especialidades/modalidades | Seleciona da lista aprovada e solicita novas (RN-10). |
| RF-17 | Materiais disponíveis | Seleção múltipla a partir de presets de equipamentos. |
| RF-18 | Contratar boost | Ativa impulsionamento com efeito em ordenação (RN-11). |

### 3.4 Busca, mapa e filtros
| ID | Requisito | Critério de aceite |
|---|---|---|
| RF-19 | Mapa com PTs próximos | Mapa não sobrepõe a barra de busca; PTs impulsionados destacados. |
| RF-20 | Busca textual | Filtra por nome do profissional ou modalidade. |
| RF-21 | Chips de modalidade | Inclui modalidades base + customizadas aprovadas. |
| RF-22 | Filtros avançados | Modalidade, preço máximo e localização. |
| RF-23 | Perfil público do PT | Foto, nota, especialidades, preço, selo de patrocínio e CTA de agendamento. |
| RF-24 | Favoritos | Adiciona/remove e ativa notificações inteligentes (RN-21). |

### 3.5 Agendamento e pagamento
| ID | Requisito | Critério de aceite |
|---|---|---|
| RF-25 | Agendar sessão pontual | Data, horário, duração (45/60/90 min), local e participantes. |
| RF-26 | Validação de horário | Slots fora da disponibilidade ou em conflito desabilitados (RN-01, RN-02). |
| RF-27 | Treino em grupo | Seletor 1–4 com recálculo automático do total (RN-05). |
| RF-28 | PAR-Q | Questionário respondido antes da confirmação (RN-24). |
| RF-29 | Pagamento da sessão | Resumo com subtotal, cupom/crédito aplicado e total. |
| RF-30 | Solicitar recorrência | Aluno propõe dia/horário fixos; PT aprova ou recusa (RN-20). |
| RF-31 | Cancelar sessão | Aplica regra de multa/reembolso e notifica a contraparte (RN-03, RN-04). |
| RF-32 | Agenda do PT | Lista sessões com selo de grupo e ações de cancelar/bloquear horário. |

### 3.6 Comunicação
| ID | Requisito | Critério de aceite |
|---|---|---|
| RF-33 | Chat aluno↔PT | Conversa por sessão/par, com histórico. |
| RF-34 | Lista de conversas do PT | Acessível pelo card "Chats" do dashboard. |
| RF-35 | Notificações | Ícone de campainha (Bell) em cliente e PT abre `/notifications` com contador de não lidas. |
| RF-36 | Avaliações | Aluno avalia após conclusão; PT visualiza suas avaliações. |

### 3.7 Carteira e finanças do PT
| ID | Requisito | Critério de aceite |
|---|---|---|
| RF-37 | Saldo disponível | Dashboard e carteira exibem "Saldo disponível" (não ganhos mensais). |
| RF-38 | Extrato de transações | Tipos: recebimento, saque, taxa, reembolso, boost. |
| RF-39 | Saque via PIX | Respeita mínimo de R$ 20 e verificação facial (RN-06, RN-07). |
| RF-40 | Progresso de fidelidade | Barra 0–7 com texto "Faltam X treinos para sua recompensa" (RN-08). |

### 3.8 Suporte, ajuda, segurança
| ID | Requisito | Critério de aceite |
|---|---|---|
| RF-41 | Ajuda (FAQ) para cliente e PT | Conteúdo em formato pergunta/resposta. |
| RF-42 | Abertura de chamado | Categoria, descrição e anexo de imagem; chamado visível ao admin. |
| RF-43 | Troca de mensagens no chamado | Aluno/PT e admin conversam dentro do ticket. |
| RF-44 | Segurança e privacidade | Alterar senha, preferências de notificação, permissão de localização, lista de bloqueados. |
| RF-45 | Exclusão de conta | Aviso permanente + confirmação por senha (RN-23). |
| RF-46 | Termos e Política consultáveis | Páginas dedicadas por papel com texto da versão vigente. |

### 3.9 Ranking
| ID | Requisito | Critério de aceite |
|---|---|---|
| RF-47 | Ranking com filtros | Filtro por modalidade e alternância bairro/cidade. |
| RF-48 | Top 3 destacado | Pódio visual e selo de patrocínio quando aplicável (RN-11, RN-12). |

### 3.10 Painel administrativo
| ID | Requisito | Critério de aceite |
|---|---|---|
| RF-49 | Listar usuários e profissionais | Busca e visualização de dados essenciais. |
| RF-50 | Aprovar/rejeitar CREF | Muda status e reflete no perfil do PT. |
| RF-51 | Visualizar agendamentos | Lista com aluno, PT, data e valor. |
| RF-52 | Bloquear usuários | Modal de confirmação; bloqueio impede acesso/uso. |
| RF-53 | Aprovar modalidades customizadas | Aba "Modalidades" com aprovar/rejeitar (RN-10). |
| RF-54 | Gerenciar chamados | Aba "Chamados" com resposta e mudança de status. |
| RF-55 | Gerenciar administradores | Criar admin com permissões granulares (RN-18). |
| RF-56 | Monitorar inativos | Ações: Reengajar, gerar Cupom, Bloquear (RN-22). |

---

## 4. Requisitos não funcionais (RNF)

### 4.1 Desempenho
| ID | Requisito |
|---|---|
| RNF-01 | Primeira renderização com SSR: conteúdo útil em ≤ 2,5 s em 4G (LCP). |
| RNF-02 | Interações de filtro/busca respondem em ≤ 150 ms para até 500 profissionais em memória. |
| RNF-03 | Consultas de listagem paginadas em blocos de até 50 registros. |

### 4.2 Segurança
| ID | Requisito |
|---|---|
| RNF-04 | RLS habilitada em todas as tabelas do schema `public`, com GRANTs explícitos por papel. |
| RNF-05 | Cliente só lê/escreve seus próprios registros; PT só os seus; admin via `has_role`. |
| RNF-06 | Papéis fora do perfil do usuário (tabela `user_roles`) para evitar escalonamento de privilégio. |
| RNF-07 | Painel `/admin/*` deve exigir autenticação + papel admin no servidor — **não pode ser alcançável apenas por URL**. |
| RNF-08 | Regras financeiras (multa, reembolso, saque, crédito) devem ser validadas no servidor, nunca só no cliente. |
| RNF-09 | Segredos e chaves privadas nunca no bundle do cliente; apenas chaves publicáveis no front. |
| RNF-10 | Funções de banco com `search_path` fixado e sem `EXECUTE` para `public`. |

### 4.3 Privacidade e LGPD
| ID | Requisito |
|---|---|
| RNF-11 | Consentimento versionado (versão + timestamp + user_id) auditável. |
| RNF-12 | Coordenadas exibidas publicamente com precisão reduzida (aproximação do bairro). |
| RNF-13 | Direito à exclusão: remoção/anonimização dos dados pessoais do titular. |
| RNF-14 | Documentos sensíveis (CREF, selfie de verificação) em bucket privado com acesso assinado. |
| RNF-15 | Minimização: endereço completo apenas quando necessário à execução do serviço. |

### 4.4 Usabilidade e acessibilidade
| ID | Requisito |
|---|---|
| RNF-16 | Layout mobile-first com contêiner máximo de ~448 px e navegação inferior fixa. |
| RNF-17 | Ações destrutivas sempre com confirmação explícita. |
| RNF-18 | Contraste mínimo AA, foco visível, rótulos `aria-label` em botões só com ícone. |
| RNF-19 | Interface integralmente em pt-BR, moeda BRL e datas no formato brasileiro. |

### 4.5 Confiabilidade e observabilidade
| ID | Requisito |
|---|---|
| RNF-20 | Disponibilidade alvo de 99,5% mensal. |
| RNF-21 | Erros de servidor capturados e registrados com identificador de requisição. |
| RNF-22 | Operações financeiras idempotentes e auditadas em log próprio. |

### 4.6 Escalabilidade e manutenibilidade
| ID | Requisito |
|---|---|
| RNF-23 | Índices nas colunas de junção e filtro mais usadas (`bookings.trainer_id`, `bookings.client_id`, `bookings.date`, `favorites.*`, `notifications.user_id`). |
| RNF-24 | Chaves estrangeiras declaradas para todo relacionamento lógico. |
| RNF-25 | Rotas de página com responsabilidade única; arquivos acima de ~300 linhas devem ser decompostos em componentes. |
| RNF-26 | Cores, sombras e gradientes apenas via tokens semânticos do design system. |

### 4.7 Compatibilidade e infraestrutura
| ID | Requisito |
|---|---|
| RNF-27 | Backend executa em runtime serverless/edge: proibido depender de binários nativos ou subprocessos. |
| RNF-28 | Lógica interna via server functions; integrações externas (webhooks/cron) em rotas públicas com verificação do chamador. |
| RNF-29 | Navegadores suportados: duas últimas versões de Chrome, Safari, Edge e Firefox (desktop e mobile). |

---

## 5. Matriz de rastreabilidade

| RF | Tela / rota | Tabela(s) | Status |
|---|---|---|---|
| RF-01…RF-07 | `/`, `/signup/client`, `/signup/professional`, `/forgot-password`, `/reset-password` | `auth.users`, `client_profiles`, `professional_profiles`, `user_roles`, `wallets` | Implementado |
| RF-06 | `/client/terms`, `/client/privacy`, `/pro/terms`, `/pro/privacy` | — | Parcial (localStorage) |
| RF-08…RF-13 | `/profile`, `/profile/personal`, `/profile/history`, `/profile/recurring`, `/profile/payments`, `/profile/coupons` | `client_profiles`, `bookings`, `recurring_bookings`, `referral_codes`, `referral_rewards` | Parcial (localStorage) |
| RF-14…RF-18 | `/pro/profile`, `/pro/signup`, `/pro/boost` | `professional_profiles`, `cref_documents` | Parcial (localStorage) |
| RF-19…RF-24 | `/home`, `/trainer/$id`, `/favorites` | `professional_profiles`, `favorites` | Parcial (mock/localStorage) |
| RF-25…RF-32 | `/booking/$id`, `/parq`, `/payment`, `/bookings`, `/pro/schedules`, `/pro/recurring` | `bookings`, `recurring_bookings` | Parcial (localStorage) |
| RF-33…RF-36 | `/chat/$id`, `/pro/chat/$id`, `/pro/chats`, `/notifications`, `/pro/notifications`, `/pro/reviews` | `notifications` | Parcial — **faltam tabelas `chats`/`messages`/`reviews`** |
| RF-37…RF-40 | `/pro/wallet`, `/pro/dashboard` | `wallets`, `wallet_transactions` | Parcial (localStorage) |
| RF-41…RF-46 | `/client/help`, `/client/support`, `/client/security`, `/pro/help`, `/pro/support`, `/pro/security` | `support_tickets`, `support_messages` | Parcial (localStorage) |
| RF-47, RF-48 | `/ranking` | `trainer_rankings` | Parcial (mock) |
| RF-49…RF-56 | `/admin/dashboard` | `admin_users`, `cref_documents`, `bookings`, `support_tickets` | Parcial e **sem proteção de acesso** |

Tabelas existentes no banco (16): `admin_users`, `bookings`, `client_profiles`, `cref_documents`, `favorites`, `notifications`, `professional_profiles`, `recurring_bookings`, `referral_codes`, `referral_rewards`, `support_messages`, `support_tickets`, `trainer_rankings`, `user_roles`, `wallet_transactions`, `wallets`.

---

## 6. Pendências e riscos

| # | Pendência | Impacto | Prioridade |
|---|---|---|---|
| P-01 | `/admin/dashboard` acessível por URL sem autenticação/verificação de papel | Crítico — exposição de dados e ações administrativas | Alta |
| P-02 | Rotas privadas (perfil, agenda, carteira) sem gate de autenticação | Alto | Alta |
| P-03 | Maior parte do estado de domínio em `localStorage`, não no banco | Alto — dados não compartilhados entre dispositivos e manipuláveis pelo usuário | Alta |
| P-04 | Regras financeiras (multa 30%, saque, crédito, fidelidade) calculadas no cliente | Alto — fraude possível | Alta |
| P-05 | Tabelas de domínio ausentes: `reviews`, `chats`, `messages`, `blocked_users`, `penalty_logs`, `refund_logs`, `custom_modalities` | Médio | Média |
| P-06 | Índices e algumas FKs ausentes | Médio — degradação com volume | Média |
| P-07 | Verificação facial é simulada (sem provedor de biometria) | Médio — controle antifraude apenas nominal | Média |
| P-08 | Pagamento sem gateway real (sem captura, split ou liquidação) | Alto para produção | Alta |
| P-09 | Arquivos "deus" (ex.: dashboard admin) dificultam evolução | Baixo/Médio | Baixa |
