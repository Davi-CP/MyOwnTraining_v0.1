// ============================================================
// Seed remoto: cria usuários (via GoTrue Admin API) e dados de
// domínio (via service role) no projeto Supabase hospedado.
//
// Uso:
//   1. Preencha SUPABASE_SERVICE_ROLE_KEY em .env.local
//      (Dashboard > Settings > API Keys -> service_role)
//   2. npm run seed:remote
//
// Idempotente: usuários existentes são ignorados; linhas de
// domínio usam upsert por id.
// ============================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error("❌ VITE_SUPABASE_URL (ou SUPABASE_URL) não encontrado.");
  process.exit(1);
}
if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY não encontrado. Preencha .env.local.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ------------------------------------------------------------
// Usuários de teste (senha padrão: senha123)
// ------------------------------------------------------------
const USERS = [
  { key: "admin", email: "admin@myowntraining.dev", role: "admin", admin2: true, full_name: "Admin Master" },
  { key: "suporte", email: "suporte@myowntraining.dev", role: "suporte", admin2: true, full_name: "Suporte" },
  { key: "financeiro", email: "financeiro@myowntraining.dev", role: "financeiro", admin2: true, full_name: "Financeiro" },
  { key: "ana", email: "ana@myowntraining.dev", role: "usuario", full_name: "Ana Pereira" },
  { key: "rafael", email: "rafael@myowntraining.dev", role: "usuario", full_name: "Rafael Souza" },
  { key: "camila", email: "camila@myowntraining.dev", role: "usuario", full_name: "Camila Oliveira" },
  { key: "cliente1", email: "cliente1@myowntraining.dev", role: "usuario", full_name: "João da Silva" },
  { key: "cliente2", email: "cliente2@myowntraining.dev", role: "usuario", full_name: "Maria Souza" },
];

const PASSWORD = "senha123";
const userIds = {}; // key -> uuid real do usuário (pode variar no projeto remoto)

// ------------------------------------------------------------
// IDs determinísticos de entidades de domínio (espelham seed.sql)
// ------------------------------------------------------------
const IDS = {
  perfis_cliente: {
    cliente1: "10000000-0000-4000-8000-000000000007",
    cliente2: "10000000-0000-4000-8000-000000000008",
  },
  perfis_personal_trainer: {
    ana: "10000000-0000-4000-8000-000000000004",
    rafael: "10000000-0000-4000-8000-000000000005",
    camila: "10000000-0000-4000-8000-000000000006",
  },
  carteiras: {
    ana: "20000000-0000-4000-8000-000000000004",
    rafael: "20000000-0000-4000-8000-000000000005",
    camila: "20000000-0000-4000-8000-000000000006",
    cliente1: "20000000-0000-4000-8000-000000000007",
  },
  indicacoes_codigo: {
    cliente1: "30000000-0000-4000-8000-000000000007",
    ana: "30000000-0000-4000-8000-000000000004",
  },
  documentos_cref: {
    ana: "40000000-0000-4000-8000-000000000004",
    rafael: "40000000-0000-4000-8000-000000000005",
    camila: "40000000-0000-4000-8000-000000000006",
  },
  agendamentos_recorrentes: { r1: "50000000-0000-4000-8000-000000000001" },
  agendamentos: {
    a1: "60000000-0000-4000-8000-000000000001",
    a2: "60000000-0000-4000-8000-000000000002",
    a3: "60000000-0000-4000-8000-000000000003",
    a4: "60000000-0000-4000-8000-000000000004",
    a5: "60000000-0000-4000-8000-000000000005",
  },
  transacoes_carteira: {
    t1: "70000000-0000-4000-8000-000000000001",
    t2: "70000000-0000-4000-8000-000000000002",
    t3: "70000000-0000-4000-8000-000000000003",
    t4: "70000000-0000-4000-8000-000000000004",
  },
  favoritos: {
    f1: "80000000-0000-4000-8000-000000000001",
    f2: "80000000-0000-4000-8000-000000000002",
  },
  notificacoes: {
    n1: "90000000-0000-4000-8000-000000000001",
    n2: "90000000-0000-4000-8000-000000000002",
  },
  chamados_suporte: { c1: "a0000000-0000-4000-8000-000000000001" },
  mensagens_suporte: {
    m1: "b0000000-0000-4000-8000-000000000001",
    m2: "b0000000-0000-4000-8000-000000000002",
  },
  indicacoes_recompensas: { rw1: "c0000000-0000-4000-8000-000000000001" },
  rankings_personais: {
    k1: "d0000000-0000-4000-8000-000000000001",
    k2: "d0000000-0000-4000-8000-000000000002",
    k3: "d0000000-0000-4000-8000-000000000003",
  },
};

// ------------------------------------------------------------
// Etapa 1: garantir usuários em auth (GoTrue Admin API)
// ------------------------------------------------------------
async function ensureUsers() {
  const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const byEmail = new Map((data?.users ?? []).map((u) => [u.email, u.id]));

  for (const u of USERS) {
    const existing = byEmail.get(u.email);
    if (existing) {
      userIds[u.key] = existing;
      console.log(`✔ usuário existente: ${u.email}`);
      continue;
    }
    const { data: created, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: u.full_name },
      app_metadata: { registered_via: "seed" },
    });
    if (error) throw new Error(`Falha ao criar usuário ${u.email}: ${error.message}`);
    userIds[u.key] = created.user.id;
    console.log(`＋ usuário criado: ${u.email}`);
  }
}

// ------------------------------------------------------------
// Etapa 2: dados de domínio (service role ignora RLS)
// ------------------------------------------------------------
async function upsertRows(table, rows, onConflict = "id") {
  if (rows.length === 0) return;
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`Falha em ${table}: ${error.message}`);
  console.log(`✔ ${table}: ${rows.length} linha(s)`);
}

const now = () => new Date().toISOString();

// id de papel/admin derivado da posição (mesmo padrão do seed.sql).
const roleId = (index) => "00000000-0000-4000-8000-" + (index + 1).toString().padStart(12, "0");

function buildDomainRows() {
  return {
    papeis_usuario: USERS.map((u, i) => ({
      id: roleId(i),
      usuario_id: userIds[u.key],
      papel: u.role,
    })),

    usuarios_admin2: USERS.filter((u) => u.admin2).map((u, i) => ({
      id: roleId(i),
      usuario_id: userIds[u.key],
      criado_em: now(),
      atualizado_em: now(),
    })),

    perfis_cliente: [
      {
        id: IDS.perfis_cliente.cliente1,
        usuario_id: userIds.cliente1,
        nome_completo: "João da Silva",
        telefone: "(11) 98888-0001",
        cidade: "São Paulo",
        uf: "SP",
        cep: "01310-100",
        bairro: "Bela Vista",
        logradouro: "Av. Paulista",
        numero: "1000",
        complemento: "Apto 42",
        latitude: -23.5614,
        longitude: -46.6559,
      },
      {
        id: IDS.perfis_cliente.cliente2,
        usuario_id: userIds.cliente2,
        nome_completo: "Maria Souza",
        telefone: "(11) 97777-0002",
        cidade: "São Paulo",
        uf: "SP",
        cep: "04018-010",
        bairro: "Vila Mariana",
        logradouro: "Rua Domingos de Morais",
        numero: "1800",
        complemento: null,
        latitude: -23.589,
        longitude: -46.639,
      },
    ],

    perfis_personal_trainer: [
      {
        id: IDS.perfis_personal_trainer.ana,
        usuario_id: userIds.ana,
        nome_completo: "Ana Pereira",
        telefone: "(11) 96666-0004",
        bio: "Personal trainer focada em funcional e mobilidade, atendimento próximo ao seu bairro.",
        cidade: "São Paulo",
        uf: "SP",
        cep: "01000-000",
        bairro: "Centro",
        logradouro: "Rua Augusta",
        numero: "2500",
        complemento: null,
        latitude: -23.5505,
        longitude: -46.6333,
        raio_atendimento_km: 10,
        especialidades: ["Funcional", "Mobilidade"],
        equipamentos: ["TRX", "Kettlebell", "Colchonete"],
        preco_por_hora: 95,
        preco_por_aula: 120,
        numero_cref: "CREF 123456-G/SP",
        avaliacao: 4.9,
        total_avaliacoes: 47,
        ativo: true,
        premium: true,
        disponibilidade: [
          { dia: 1, inicio: "06:00", fim: "12:00" },
          { dia: 3, inicio: "06:00", fim: "12:00" },
          { dia: 5, inicio: "06:00", fim: "12:00" },
        ],
      },
      {
        id: IDS.perfis_personal_trainer.rafael,
        usuario_id: userIds.rafael,
        nome_completo: "Rafael Souza",
        telefone: "(11) 95555-0005",
        bio: "Especialista em musculação e treino em grupo, hipertrofia e performance.",
        cidade: "São Paulo",
        uf: "SP",
        cep: "04101-000",
        bairro: "Vila Mariana",
        logradouro: "Av. Lins de Vasconcelos",
        numero: "3400",
        complemento: null,
        latitude: -23.5868,
        longitude: -46.6341,
        raio_atendimento_km: 8,
        especialidades: ["Musculação", "Treino em grupo"],
        equipamentos: ["Halteres", "Barras", "Anilhas"],
        preco_por_hora: 110,
        preco_por_aula: 140,
        numero_cref: "CREF 234567-G/SP",
        avaliacao: 4.8,
        total_avaliacoes: 32,
        ativo: true,
        premium: false,
        disponibilidade: [
          { dia: 2, inicio: "17:00", fim: "22:00" },
          { dia: 4, inicio: "17:00", fim: "22:00" },
        ],
      },
      {
        id: IDS.perfis_personal_trainer.camila,
        usuario_id: userIds.camila,
        nome_completo: "Camila Oliveira",
        telefone: "(11) 94444-0006",
        bio: "Pilates e mobilidade com foco em qualidade de vida e prevenção de lesões.",
        cidade: "São Paulo",
        uf: "SP",
        cep: "04077-000",
        bairro: "Moema",
        logradouro: "Av. Ibirapuera",
        numero: "2907",
        complemento: null,
        latitude: -23.6062,
        longitude: -46.662,
        raio_atendimento_km: 7,
        especialidades: ["Pilates", "Mobilidade"],
        equipamentos: ["Reformer", "Bola suíça", "Faixas elásticas"],
        preco_por_hora: 125,
        preco_por_aula: 150,
        numero_cref: "CREF 345678-G/SP",
        avaliacao: 5,
        total_avaliacoes: 61,
        ativo: true,
        premium: true,
        disponibilidade: [
          { dia: 1, inicio: "08:00", fim: "14:00" },
          { dia: 4, inicio: "08:00", fim: "14:00" },
        ],
      },
    ],

    carteiras: [
      { id: IDS.carteiras.ana, usuario_id: userIds.ana, saldo_disponivel: 1284, saldo_pendente: 95 },
      { id: IDS.carteiras.rafael, usuario_id: userIds.rafael, saldo_disponivel: 540, saldo_pendente: 0 },
      { id: IDS.carteiras.camila, usuario_id: userIds.camila, saldo_disponivel: 890.5, saldo_pendente: 110 },
      { id: IDS.carteiras.cliente1, usuario_id: userIds.cliente1, saldo_disponivel: 200, saldo_pendente: 0 },
    ],

    indicacoes_codigo: [
      { id: IDS.indicacoes_codigo.cliente1, usuario_id: userIds.cliente1, codigo: "JOAO10", ativo: true, quantidade_usos: 1 },
      { id: IDS.indicacoes_codigo.ana, usuario_id: userIds.ana, codigo: "ANA-FIT", ativo: true, quantidade_usos: 0 },
    ],

    documentos_cref: [
      {
        id: IDS.documentos_cref.ana,
        personal_id: IDS.perfis_personal_trainer.ana,
        numero_cref: "CREF 123456-G/SP",
        url_documento: "https://storage.example.com/cref/ana.pdf",
        status: "aprovado",
        revisado_por: userIds.admin,
        revisado_em: now(),
        observacoes: "Documento válido",
      },
      {
        id: IDS.documentos_cref.rafael,
        personal_id: IDS.perfis_personal_trainer.rafael,
        numero_cref: "CREF 234567-G/SP",
        url_documento: "https://storage.example.com/cref/rafael.pdf",
        status: "aprovado",
        revisado_por: userIds.admin,
        revisado_em: now(),
        observacoes: "Documento válido",
      },
      {
        id: IDS.documentos_cref.camila,
        personal_id: IDS.perfis_personal_trainer.camila,
        numero_cref: "CREF 345678-G/SP",
        url_documento: "https://storage.example.com/cref/camila.pdf",
        status: "aprovado",
        revisado_por: userIds.suporte,
        revisado_em: now(),
        observacoes: "Documento válido",
      },
    ],

    agendamentos_recorrentes: [
      {
        id: IDS.agendamentos_recorrentes.r1,
        cliente_id: IDS.perfis_cliente.cliente1,
        personal_id: IDS.perfis_personal_trainer.ana,
        dia_semana: 1,
        hora_inicio: "07:00",
        duracao_minutos: 60,
        local: "Parque do Ibirapuera",
        data_inicio: "2026-09-01",
        data_fim: "2026-12-01",
        ativo: true,
      },
    ],

    agendamentos: [
      {
        id: IDS.agendamentos.a1,
        cliente_id: IDS.perfis_cliente.cliente1,
        personal_id: IDS.perfis_personal_trainer.ana,
        recorrencia_id: IDS.agendamentos_recorrentes.r1,
        agendado_para: "2026-09-07T07:00:00-03:00",
        duracao_minutos: 60,
        local: "Parque do Ibirapuera",
        status: "concluido",
        observacoes: null,
        subtotal: 95,
        desconto: 0,
        taxa_plataforma: 14.25,
        valor_personal: 80.75,
        total: 95,
      },
      {
        id: IDS.agendamentos.a2,
        cliente_id: IDS.perfis_cliente.cliente1,
        personal_id: IDS.perfis_personal_trainer.ana,
        recorrencia_id: IDS.agendamentos_recorrentes.r1,
        agendado_para: "2026-09-14T07:00:00-03:00",
        duracao_minutos: 60,
        local: "Parque do Ibirapuera",
        status: "confirmado",
        observacoes: null,
        subtotal: 95,
        desconto: 0,
        taxa_plataforma: 14.25,
        valor_personal: 80.75,
        total: 95,
      },
      {
        id: IDS.agendamentos.a3,
        cliente_id: IDS.perfis_cliente.cliente1,
        personal_id: IDS.perfis_personal_trainer.rafael,
        recorrencia_id: null,
        agendado_para: "2026-09-16T18:30:00-03:00",
        duracao_minutos: 60,
        local: "Academia Vila Mariana",
        status: "confirmado",
        observacoes: "Levar troca de roupa extra",
        subtotal: 110,
        desconto: 0,
        taxa_plataforma: 16.5,
        valor_personal: 93.5,
        total: 110,
      },
      {
        id: IDS.agendamentos.a4,
        cliente_id: IDS.perfis_cliente.cliente2,
        personal_id: IDS.perfis_personal_trainer.camila,
        recorrencia_id: null,
        agendado_para: "2026-09-10T09:00:00-03:00",
        duracao_minutos: 55,
        local: "Studio Camila Oliveira",
        status: "concluido",
        observacoes: null,
        subtotal: 125,
        desconto: 0,
        taxa_plataforma: 18.75,
        valor_personal: 106.25,
        total: 125,
      },
      {
        id: IDS.agendamentos.a5,
        cliente_id: IDS.perfis_cliente.cliente2,
        personal_id: IDS.perfis_personal_trainer.ana,
        recorrencia_id: null,
        agendado_para: "2026-09-12T07:00:00-03:00",
        duracao_minutos: 60,
        local: "Parque do Ibirapuera",
        status: "cancelado",
        observacoes: "Cliente cancelou por imprevisto",
        subtotal: 95,
        desconto: 0,
        taxa_plataforma: 0,
        valor_personal: 0,
        total: 95,
      },
    ],

    transacoes_carteira: [
      {
        id: IDS.transacoes_carteira.t1,
        carteira_id: IDS.carteiras.ana,
        agendamento_id: IDS.agendamentos.a1,
        valor: 80.75,
        tipo: "credito",
        status: "concluida",
        descricao: "Repasse do agendamento de João da Silva",
      },
      {
        id: IDS.transacoes_carteira.t2,
        carteira_id: IDS.carteiras.ana,
        agendamento_id: null,
        valor: 500,
        tipo: "saque",
        status: "concluida",
        descricao: "Saque para conta bancária",
      },
      {
        id: IDS.transacoes_carteira.t3,
        carteira_id: IDS.carteiras.rafael,
        agendamento_id: IDS.agendamentos.a3,
        valor: 93.5,
        tipo: "credito",
        status: "pendente",
        descricao: "Repasse do agendamento de João da Silva",
      },
      {
        id: IDS.transacoes_carteira.t4,
        carteira_id: IDS.carteiras.camila,
        agendamento_id: IDS.agendamentos.a4,
        valor: 106.25,
        tipo: "credito",
        status: "concluida",
        descricao: "Repasse do agendamento de Maria Souza",
      },
    ],

    favoritos: [
      { id: IDS.favoritos.f1, cliente_id: IDS.perfis_cliente.cliente1, personal_id: IDS.perfis_personal_trainer.ana },
      { id: IDS.favoritos.f2, cliente_id: IDS.perfis_cliente.cliente1, personal_id: IDS.perfis_personal_trainer.camila },
    ],

    notificacoes: [
      {
        id: IDS.notificacoes.n1,
        usuario_id: userIds.cliente1,
        titulo: "Agendamento confirmado",
        corpo: "Seu treino com Ana Pereira foi confirmado.",
        tipo: "agendamento",
        dados: { agendamento_id: IDS.agendamentos.a2 },
        lida_em: null,
      },
      {
        id: IDS.notificacoes.n2,
        usuario_id: userIds.ana,
        titulo: "Novo agendamento",
        corpo: "Você tem um novo agendamento com João da Silva.",
        tipo: "agendamento",
        dados: { agendamento_id: IDS.agendamentos.a2 },
        lida_em: "2026-09-08T08:00:00-03:00",
      },
    ],

    chamados_suporte: [
      {
        id: IDS.chamados_suporte.c1,
        usuario_id: userIds.cliente1,
        assunto: "Dúvida sobre pagamento",
        categoria: "financeiro",
        prioridade: "media",
        status: "em_andamento",
      },
    ],

    mensagens_suporte: [
      {
        id: IDS.mensagens_suporte.m1,
        chamado_id: IDS.chamados_suporte.c1,
        usuario_id: userIds.cliente1,
        mensagem: "Olá, não recebi a confirmação do pagamento do agendamento de hoje.",
        anexos: null,
      },
      {
        id: IDS.mensagens_suporte.m2,
        chamado_id: IDS.chamados_suporte.c1,
        usuario_id: userIds.admin,
        mensagem: "Olá João, verificamos e o pagamento foi confirmado. Qualquer dúvida estamos à disposição.",
        anexos: null,
      },
    ],

    indicacoes_recompensas: [
      {
        id: IDS.indicacoes_recompensas.rw1,
        codigo_indicacao_id: IDS.indicacoes_codigo.cliente1,
        usuario_indicado_id: userIds.cliente2,
        valor_recompensa: 20,
        status: "pendente",
      },
    ],

    rankings_personais: [
      {
        id: IDS.rankings_personais.k1,
        personal_id: IDS.perfis_personal_trainer.ana,
        pontuacao: 4850.5,
        posicao: 1,
        periodo: "2026-07",
        modalidade: "Funcional",
        cidade: "São Paulo",
        bairro: "Centro",
      },
      {
        id: IDS.rankings_personais.k2,
        personal_id: IDS.perfis_personal_trainer.rafael,
        pontuacao: 4120,
        posicao: 2,
        periodo: "2026-07",
        modalidade: "Musculação",
        cidade: "São Paulo",
        bairro: "Vila Mariana",
      },
      {
        id: IDS.rankings_personais.k3,
        personal_id: IDS.perfis_personal_trainer.camila,
        pontuacao: 3890,
        posicao: 3,
        periodo: "2026-07",
        modalidade: "Pilates",
        cidade: "São Paulo",
        bairro: "Moema",
      },
    ],
  };
}

// ------------------------------------------------------------
// Ordem de inserção respeita as FK (agendamentos antes de transações
// porque transacoes_carteira referenciam agendamentos).
// ------------------------------------------------------------
// Colunas de conflito/upsert por tabela (constraints únicas reais).
const ON_CONFLICT = {
  papeis_usuario: "usuario_id,papel",
  usuarios_admin2: "usuario_id",
  carteiras: "usuario_id",
  indicacoes_codigo: "usuario_id",
  perfis_cliente: "usuario_id",
  perfis_personal_trainer: "usuario_id",
  documentos_cref: "id",
  agendamentos_recorrentes: "id",
  agendamentos: "id",
  transacoes_carteira: "id",
  favoritos: "id",
  notificacoes: "id",
  chamados_suporte: "id",
  mensagens_suporte: "id",
  indicacoes_recompensas: "id",
  rankings_personais: "id",
};

const SEQUENCE = [
  "papeis_usuario",
  "usuarios_admin2",
  "perfis_cliente",
  "perfis_personal_trainer",
  "carteiras",
  "indicacoes_codigo",
  "documentos_cref",
  "agendamentos_recorrentes",
  "agendamentos",
  "transacoes_carteira",
  "favoritos",
  "notificacoes",
  "chamados_suporte",
  "mensagens_suporte",
  "indicacoes_recompensas",
  "rankings_personais",
];

async function main() {
  console.log(`🎯 Seed remoto em ${SUPABASE_URL}`);

  await ensureUsers();

  const rows = buildDomainRows();
  for (const table of SEQUENCE) {
    await upsertRows(table, rows[table], ON_CONFLICT[table]);
  }

  console.log("\n✅ Seed concluído. Credenciais de teste (senha: senha123):");
  for (const u of USERS) console.log(`   ${u.email}  (${u.role})`);
}

main().catch((err) => {
  console.error(`\n❌ ${err.message}`);
  process.exit(1);
});