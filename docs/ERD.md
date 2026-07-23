# ERD — Sistema de Personal Trainers

## Convenções de nomenclatura

- Tabelas e atributos da aplicação em **PT-BR**.
- `auth.users` é mantida como tabela nativa do Supabase.
- Chaves estrangeiras seguem o padrão `<entidade>_id`.
- Datas e timestamps seguem o padrão `<acao>_em`, exceto `agendado_para`, quando representa um horário futuro de agendamento.
- Campos booleanos não utilizam prefixo `is_`.
- Campos financeiros utilizam nomes explícitos em português.
- Campos JSON utilizam nomes que indicam seu conteúdo (`dados`, `anexos`, `disponibilidade`).

---

# 1. Usuários — `auth.users`

## Descrição

Tabela nativa de autenticação do Supabase. Representa a conta autenticada do usuário no sistema.

Não é uma tabela de domínio controlada diretamente pela aplicação.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único do usuário |
| `email` | texto | E-mail da conta |
| `created_at` | timestamp | Campo nativo do Supabase, quando disponível |
| `updated_at` | timestamp | Campo nativo do Supabase, quando disponível |

> Os campos efetivamente disponíveis dependem da estrutura interna do Supabase Auth. O atributo principal utilizado como referência pelas tabelas da aplicação é `id`.

## Relacionamentos

- `0..1` → `perfis_cliente`
- `0..1` → `perfis_personal_trainer`
- `0..1` → `usuarios_admin` — somente se essa tabela for mantida
- `N` → `papeis_usuario`
- `0..1` → `carteiras`
- `0..1` → `indicacoes_codigo`
- `N` → `indicacoes_recompensas` como usuário indicado
- `N` → `notificacoes`
- `N` → `chamados_suporte`
- `N` → `mensagens_suporte`
- `N` → `documentos_cref` como revisor

---

# 2. Perfis de clientes — `perfis_cliente`

## Descrição

Representa os dados de domínio específicos de um cliente da plataforma.

A separação entre `auth.users` e `perfis_cliente` mantém a conta de autenticação independente dos dados específicos do cliente.

Também permite que um mesmo usuário possa, futuramente, atuar como cliente e personal trainer.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único do perfil |
| `usuario_id` | UUID / FK | Referência a `auth.users.id` |
| `nome_completo` | texto | Nome completo do cliente |
| `telefone` | texto | Telefone de contato |
| `cidade` | texto | Cidade de residência |
| `uf` | texto | Unidade federativa |
| `cep` | texto | Código de Endereçamento Postal |
| `bairro` | texto | Bairro |
| `logradouro` | texto | Rua, avenida ou logradouro |
| `numero` | texto | Número do endereço |
| `complemento` | texto | Complemento do endereço |
| `latitude` | decimal | Latitude da localização |
| `longitude` | decimal | Longitude da localização |
| `criado_em` | timestamp | Data e hora de criação |
| `atualizado_em` | timestamp | Data e hora da última atualização |

## Constraints recomendadas

- `usuario_id` → FK para `auth.users.id`
- `UNIQUE (usuario_id)`

## Relacionamentos

- `usuario_id` → `auth.users.id` — 1:1
- Um cliente possui `N` → `agendamentos`
- Um cliente possui `N` → `agendamentos_recorrentes`
- Um cliente possui `N` → `favoritos`

---

# 3. Perfis de personal trainers — `perfis_personal_trainer`

## Descrição

Representa o perfil profissional do personal trainer que oferece serviços na plataforma.

Contém dados profissionais, localização de atendimento, especialidades, equipamentos, preços, reputação e disponibilidade.

## Atributos principais

### Identificação

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único do perfil |
| `usuario_id` | UUID / FK | Referência a `auth.users.id` |
| `nome_completo` | texto | Nome completo do profissional |
| `telefone` | texto | Telefone de contato |
| `bio` | texto | Biografia ou apresentação profissional |

### Localização

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `cidade` | texto | Cidade de atendimento |
| `uf` | texto | Unidade federativa |
| `cep` | texto | Código de Endereçamento Postal |
| `bairro` | texto | Bairro |
| `logradouro` | texto | Rua, avenida ou logradouro |
| `numero` | texto | Número do endereço |
| `complemento` | texto | Complemento do endereço |
| `latitude` | decimal | Latitude da localização |
| `longitude` | decimal | Longitude da localização |
| `raio_atendimento_km` | decimal | Raio máximo de atendimento em quilômetros |

### Informações profissionais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `especialidades` | array / JSON | Especialidades oferecidas |
| `equipamentos` | array / JSON | Equipamentos disponíveis |
| `preco_por_hora` | decimal | Preço por hora |
| `preco_por_aula` | decimal | Preço por aula |
| `numero_cref` | texto | Número profissional do CREF |

### Reputação

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `avaliacao` | decimal | Avaliação média do profissional |
| `total_avaliacoes` | inteiro | Quantidade total de avaliações |

### Status

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `ativo` | boolean | Indica se o perfil está ativo |
| `premium` | boolean | Indica se o profissional possui status premium |

### Disponibilidade

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `disponibilidade` | JSON | Disponibilidade semanal, caso seja mantida diretamente no perfil |

### Auditoria

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `criado_em` | timestamp | Data e hora de criação |
| `atualizado_em` | timestamp | Data e hora da última atualização |

## Constraints recomendadas

- `usuario_id` → FK para `auth.users.id`
- `UNIQUE (usuario_id)`

## Relacionamentos

- `usuario_id` → `auth.users.id` — 1:1
- Um personal possui `N` → `agendamentos`
- Um personal possui `N` → `agendamentos_recorrentes`
- Um personal possui `N` → `favoritos`
- Um personal possui `N` → `documentos_cref`
- Um personal possui `N` → `rankings_personais`

## Observações

- `numero_cref` representa o número profissional atual/oficial.
- Não é recomendado manter `cref_verificado` como booleano separado.
- A situação de verificação deve ser derivada do documento CREF vigente/aprovado em `documentos_cref`.
- Se `bio` não for desejado como termo técnico, pode ser substituído por `biografia`.

---

# 4. Agendamentos — `agendamentos`

## Descrição

Representa uma sessão individual de treino agendada entre um cliente e um personal trainer.

É o registro efetivo de uma sessão na agenda.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único do agendamento |
| `cliente_id` | UUID / FK | Referência a `perfis_cliente.id` |
| `personal_id` | UUID / FK | Referência a `perfis_personal_trainer.id` |
| `recorrencia_id` | UUID / FK / NULL | Referência opcional a `agendamentos_recorrentes.id` |
| `agendado_para` | timestamp | Data e hora previstas para a sessão |
| `duracao_minutos` | inteiro | Duração da sessão em minutos |
| `local` | texto / JSON | Local onde a sessão será realizada |
| `status` | enum / texto | Estado atual do agendamento |
| `observacoes` | texto | Observações relacionadas à sessão |

### Valores financeiros

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `subtotal` | decimal | Valor bruto antes de descontos e taxas |
| `desconto` | decimal | Valor ou desconto aplicado |
| `taxa_plataforma` | decimal | Taxa retida pela plataforma |
| `valor_personal` | decimal | Valor destinado ao personal trainer |
| `total` | decimal | Valor total da transação |

### Auditoria

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `criado_em` | timestamp | Data e hora de criação |
| `atualizado_em` | timestamp | Data e hora da última atualização |

## Relacionamentos

- `cliente_id` → `perfis_cliente.id`
- `personal_id` → `perfis_personal_trainer.id`
- `recorrencia_id` → `agendamentos_recorrentes.id`, opcional
- Um agendamento pode gerar `N` → `transacoes_carteira`

## Observação

O campo `quantidade` foi removido do modelo básico.

Se representar quantidade de aulas adquiridas em um pacote, recomenda-se criar uma entidade comercial separada, como `contratacoes` ou `pedidos`.

---

# 5. Agendamentos recorrentes — `agendamentos_recorrentes`

## Descrição

Define uma regra de recorrência para sessões periódicas.

A recorrência não representa necessariamente uma sessão individual; ela funciona como uma regra que pode gerar vários agendamentos.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único da recorrência |
| `cliente_id` | UUID / FK | Referência a `perfis_cliente.id` |
| `personal_id` | UUID / FK | Referência a `perfis_personal_trainer.id` |
| `dia_semana` | inteiro / enum | Dia da semana da recorrência |
| `hora_inicio` | time | Horário de início |
| `duracao_minutos` | inteiro | Duração em minutos |
| `local` | texto / JSON | Local da sessão |
| `data_inicio` | date | Início da vigência |
| `data_fim` | date / NULL | Fim da vigência |
| `ativo` | boolean | Indica se a recorrência está ativa |
| `criado_em` | timestamp | Data e hora de criação |
| `atualizado_em` | timestamp | Data e hora da última atualização |

## Relacionamentos

- `cliente_id` → `perfis_cliente.id`
- `personal_id` → `perfis_personal_trainer.id`
- Uma recorrência gera `N` → `agendamentos`

## Exemplo

```text
Agendamento recorrente #10
├── Segunda-feira
├── 08:00
├── 60 minutos
├── 01/08 → 30/09
│
├── Agendamento 01/08
├── Agendamento 08/08
├── Agendamento 15/08
└── Agendamento 22/08
```

---

# 6. Favoritos — `favoritos`

## Descrição

Tabela associativa que representa os personal trainers favoritados por clientes.

Modela uma relação N:N entre clientes e personal trainers.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `cliente_id` | UUID / FK | Referência a `perfis_cliente.id` |
| `personal_id` | UUID / FK | Referência a `perfis_personal_trainer.id` |
| `criado_em` | timestamp | Data e hora em que o favorito foi criado |

## Relacionamentos

- `cliente_id` → `perfis_cliente.id`
- `personal_id` → `perfis_personal_trainer.id`

## Constraint recomendada

```text
UNIQUE (cliente_id, personal_id)
```

---

# 7. Documentos CREF — `documentos_cref`

## Descrição

Armazena os documentos enviados pelos personal trainers para comprovação do registro profissional.

Permite manter histórico de submissões, rejeições e novas tentativas.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `personal_id` | UUID / FK | Referência a `perfis_personal_trainer.id` |
| `numero_cref` | texto | Número do CREF associado ao documento |
| `url_documento` | texto | URL ou referência ao documento armazenado |
| `status` | enum / texto | Estado da análise do documento |
| `revisado_por` | UUID / FK / NULL | Usuário que revisou o documento |
| `revisado_em` | timestamp / NULL | Data e hora da revisão |
| `observacoes` | texto / NULL | Observações da análise |
| `criado_em` | timestamp | Data e hora de criação |
| `atualizado_em` | timestamp | Data e hora da última atualização |

## Status possíveis

```text
pendente
aprovado
rejeitado
```

## Relacionamentos

- `personal_id` → `perfis_personal_trainer.id`
- `revisado_por` → `auth.users.id`
- Um personal possui `N` documentos ao longo do tempo

## Regra de negócio

Pode existir histórico de documentos, mas somente um documento deve representar a verificação vigente.

A regra pode ser implementada por uma combinação de status e constraint/lógica que garanta apenas um documento aprovado vigente por personal.

---

# 8. Carteiras — `carteiras`

## Descrição

Representa a carteira financeira de um usuário.

Cada usuário possui no máximo uma carteira.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único da carteira |
| `usuario_id` | UUID / FK | Referência a `auth.users.id` |
| `saldo_disponivel` | decimal | Saldo disponível para utilização |
| `saldo_pendente` | decimal | Saldo ainda pendente de liberação |
| `criado_em` | timestamp | Data e hora de criação |
| `atualizado_em` | timestamp | Data e hora da última atualização |

## Constraints recomendadas

- `usuario_id` → FK para `auth.users.id`
- `UNIQUE (usuario_id)`

## Relacionamentos

- `usuario_id` → `auth.users.id` — 1:1
- Uma carteira possui `N` → `transacoes_carteira`

---

# 9. Transações da carteira — `transacoes_carteira`

## Descrição

Representa cada movimentação financeira registrada em uma carteira.

Pode representar créditos, débitos, estornos, pagamentos ou outros eventos financeiros.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `carteira_id` | UUID / FK | Referência a `carteiras.id` |
| `agendamento_id` | UUID / FK / NULL | Referência opcional a `agendamentos.id` |
| `valor` | decimal | Valor da movimentação |
| `tipo` | enum / texto | Tipo da movimentação |
| `status` | enum / texto | Estado da transação |
| `descricao` | texto | Descrição da movimentação |
| `criado_em` | timestamp | Data e hora de criação |
| `atualizado_em` | timestamp | Data e hora da última atualização |

## Relacionamentos

- `carteira_id` → `carteiras.id`
- `agendamento_id` → `agendamentos.id`, opcional

## Observação

O `usuario_id` não é armazenado diretamente na transação.

O usuário dono da transação pode ser obtido por:

```text
transacoes_carteira
    ↓
carteiras
    ↓
auth.users
```

Isso reduz redundância e evita inconsistências.

## Observação arquitetural

Se o sistema possuir pagamentos, saques, reembolsos, compras de pacotes e recompensas, pode ser necessário introduzir entidades financeiras/comerciais adicionais, como:

- `contratacoes`
- `pedidos`
- `pagamentos`

---

# 10. Notificações — `notificacoes`

## Descrição

Armazena notificações enviadas aos usuários.

Pode representar notificações de agendamento, pagamentos, suporte, promoções etc.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `usuario_id` | UUID / FK | Referência a `auth.users.id` |
| `titulo` | texto | Título da notificação |
| `corpo` | texto | Corpo da notificação |
| `tipo` | enum / texto | Tipo da notificação |
| `dados` | JSON / NULL | Dados adicionais relacionados à notificação |
| `lida_em` | timestamp / NULL | Data e hora em que foi lida |
| `criado_em` | timestamp | Data e hora de criação |

## Relacionamentos

- `usuario_id` → `auth.users.id`
- Um usuário possui `N` notificações

## Observação

`lida_em` é preferível a um campo booleano `lida`, pois permite saber quando a notificação foi visualizada.

---

# 11. Códigos de indicação — `indicacoes_codigo`

## Descrição

Representa o código de indicação pertencente a um usuário.

Um usuário possui no máximo um código de indicação.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `usuario_id` | UUID / FK | Referência a `auth.users.id` |
| `codigo` | texto | Código alfanumérico único |
| `ativo` | boolean | Indica se o código está ativo |
| `quantidade_usos` | inteiro | Quantidade de vezes que o código foi utilizado |
| `criado_em` | timestamp | Data e hora de criação |
| `atualizado_em` | timestamp | Data e hora da última atualização |

## Constraints recomendadas

```text
UNIQUE (usuario_id)
UNIQUE (codigo)
```

## Relacionamentos

- `usuario_id` → `auth.users.id` — 1:1
- Um código gera `N` → `indicacoes_recompensas`

---

# 12. Recompensas de indicação — `indicacoes_recompensas`

## Descrição

Registra uma recompensa gerada quando um usuário é indicado por outro através de um código de indicação.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `codigo_indicacao_id` | UUID / FK | Referência a `indicacoes_codigo.id` |
| `usuario_indicado_id` | UUID / FK | Usuário que foi indicado |
| `valor_recompensa` | decimal | Valor da recompensa |
| `status` | enum / texto | Estado da recompensa |
| `criado_em` | timestamp | Data e hora de criação |
| `atualizado_em` | timestamp | Data e hora da última atualização |

## Relacionamentos

- `codigo_indicacao_id` → `indicacoes_codigo.id`
- `usuario_indicado_id` → `auth.users.id`

O usuário que indicou é obtido através de:

```text
indicacoes_recompensas
    ↓
indicacoes_codigo
    ↓
usuario_id
    ↓
auth.users
```

## Observação

Não é necessário armazenar `indicador_id` separadamente, pois o usuário indicador pode ser derivado do código de indicação utilizado.

---

# 13. Chamados de suporte — `chamados_suporte`

## Descrição

Representa um chamado de suporte aberto por um usuário.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `usuario_id` | UUID / FK | Usuário que abriu o chamado |
| `assunto` | texto | Assunto do chamado |
| `categoria` | enum / texto | Categoria do chamado |
| `prioridade` | enum / texto | Prioridade do atendimento |
| `status` | enum / texto | Estado atual do chamado |
| `criado_em` | timestamp | Data e hora de criação |
| `atualizado_em` | timestamp | Data e hora da última atualização |
| `fechado_em` | timestamp / NULL | Data e hora do fechamento |

## Relacionamentos

- `usuario_id` → `auth.users.id`
- Um usuário possui `N` chamados
- Um chamado possui `N` → `mensagens_suporte`

---

# 14. Mensagens de suporte — `mensagens_suporte`

## Descrição

Representa uma mensagem individual dentro de um chamado de suporte.

Pode ser enviada pelo próprio usuário ou por um atendente.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `chamado_id` | UUID / FK | Referência a `chamados_suporte.id` |
| `usuario_id` | UUID / FK | Usuário que enviou a mensagem |
| `mensagem` | texto | Conteúdo da mensagem |
| `anexos` | JSON / NULL | Anexos associados à mensagem |
| `criado_em` | timestamp | Data e hora de criação |

## Relacionamentos

- `chamado_id` → `chamados_suporte.id`
- `usuario_id` → `auth.users.id`

## Observação

O `usuario_id` pode representar:

- o usuário que abriu o chamado;
- um usuário administrativo;
- um usuário de suporte.

A autorização para envio deve ser controlada pelas regras de acesso e RLS.

---

# 15. Rankings de personal trainers — `rankings_personais`

## Descrição

Armazena resultados calculados de rankings de personal trainers.

Permite rankings por período, modalidade e região.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `personal_id` | UUID / FK | Referência a `perfis_personal_trainer.id` |
| `pontuacao` | decimal | Pontuação calculada |
| `posicao` | inteiro | Posição no ranking |
| `periodo` | texto / date range | Período de referência do ranking |
| `modalidade` | texto / FK | Modalidade considerada |
| `cidade` | texto / NULL | Filtro regional por cidade |
| `bairro` | texto / NULL | Filtro regional por bairro |
| `calculado_em` | timestamp | Data e hora do cálculo do ranking |

## Relacionamentos

- `personal_id` → `perfis_personal_trainer.id`
- Um personal aparece em `N` rankings ao longo do tempo

## Constraint recomendada

A combinação deve ser única para evitar duplicação:

```text
UNIQUE (
    personal_id,
    periodo,
    modalidade,
    cidade,
    bairro
)
```

A definição final depende da modelagem de `periodo`.

---

# 16. Papéis de usuário — `papeis_usuario`

## Descrição

Define os papéis de autorização associados a um usuário.

É a fonte de verdade para autorização baseada em papel.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `usuario_id` | UUID / FK | Referência a `auth.users.id` |
| `papel` | enum `papel_usuario` | Papel de autorização do usuário |

## Valores possíveis

```text
admin
suporte
financeiro
usuario
```

## Relacionamentos

- `usuario_id` → `auth.users.id`

## Constraint recomendada

Se um usuário puder acumular múltiplos papéis:

```text
UNIQUE (usuario_id, papel)
```

Assim, o mesmo usuário pode possuir:

```text
admin
suporte
```

sem permitir duplicação do mesmo papel.

---

# 17. Usuários administrativos — `usuarios_admin`

## Descrição

Representa dados específicos de usuários que fazem parte da estrutura administrativa da plataforma.

Essa tabela não deve ser a fonte de verdade para o papel de autorização. Os papéis devem ser definidos em `papeis_usuario`.

## Atributos principais

| Atributo | Tipo conceitual | Descrição |
|---|---|---|
| `id` | UUID | Identificador único |
| `usuario_id` | UUID / FK | Referência a `auth.users.id` |
| `criado_em` | timestamp | Data e hora de criação |
| `atualizado_em` | timestamp | Data e hora da última atualização |

## Constraints recomendadas

- `usuario_id` → FK para `auth.users.id`
- `UNIQUE (usuario_id)`

## Relacionamentos

- `usuario_id` → `auth.users.id` — 1:1
- Um usuário administrativo possui papéis definidos em `papeis_usuario`

## Observação arquitetural

Esta tabela só deve ser mantida se representar uma entidade de domínio real, por exemplo, um funcionário administrativo com atributos próprios.

Se ela existir apenas para indicar que um usuário é `admin`, `suporte` ou `financeiro`, pode ser redundante, pois `papeis_usuario` já cumpre essa função.

---

# Visão consolidada das relações

```text
auth.users
│
├── 0..1 ── perfis_cliente
│              │
│              ├── 1:N ── agendamentos
│              ├── 1:N ── agendamentos_recorrentes
│              └── 1:N ── favoritos
│
├── 0..1 ── perfis_personal_trainer
│              │
│              ├── 1:N ── agendamentos
│              ├── 1:N ── agendamentos_recorrentes
│              ├── 1:N ── favoritos
│              ├── 1:N ── documentos_cref
│              └── 1:N ── rankings_personais
│
├── 0..1 ── carteiras
│              │
│              └── 1:N ── transacoes_carteira
│
├── 0..1 ── indicacoes_codigo
│              │
│              └── 1:N ── indicacoes_recompensas
│
├── 1:N ─── notificacoes
├── 1:N ─── chamados_suporte
├── 1:N ─── mensagens_suporte
├── 1:N ─── documentos_cref (como revisor)
└── 1:N ─── papeis_usuario

agendamentos_recorrentes
        │
        └── 1:N ── agendamentos

chamados_suporte
        │
        └── 1:N ── mensagens_suporte

indicacoes_codigo
        │
        └── 1:N ── indicacoes_recompensas
```

---

# Decisões de nomenclatura adotadas

| Conceito | Nome adotado |
|---|---|
| User ID | `usuario_id` |
| Client ID | `cliente_id` |
| Trainer ID | `personal_id` |
| Wallet ID | `carteira_id` |
| Booking ID | `agendamento_id` |
| Recurrence ID | `recorrencia_id` |
| Ticket ID | `chamado_id` |
| Referral Code ID | `codigo_indicacao_id` |
| Created At | `criado_em` |
| Updated At | `atualizado_em` |
| Scheduled At | `agendado_para` |
| Duration | `duracao_minutos` |
| Location | `local` |
| Discount | `desconto` |
| Trainer Receives | `valor_personal` |
| Balance | `saldo_disponivel` |
| Pending Balance | `saldo_pendente` |
| Amount | `valor` |
| Type | `tipo` |
| Description | `descricao` |
| Read At | `lida_em` |
| Closed At | `fechado_em` |
| Reviewed By | `revisado_por` |
| Reviewed At | `revisado_em` |
| Score | `pontuacao` |
| Position | `posicao` |
| Computed At | `calculado_em` |
| Referral Code | `codigo` |
| Uses Count | `quantidade_usos` |
| Reward Amount | `valor_recompensa` |
| Referred User | `usuario_indicado_id` |
| Attachments | `anexos` |
| User Roles | `papeis_usuario` |
| User Role Enum | `papel_usuario` |
