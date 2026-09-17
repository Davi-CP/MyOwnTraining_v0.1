-- ============================================================
-- Seed: My Own Training
-- Carregado automaticamente pelo `supabase db reset` local
-- (configurado em config.toml -> [db.seed] -> sql_paths = ["./seed.sql"]).
--
-- Idempotente: todos os inserts usam `on conflict ... do nothing`,
-- então pode ser executado múltiplas vezes com segurança.
--
-- Credenciais de teste (senha de todos os usuários):
--   admin@myowntraining.dev     / senha123  (admin)
--   suporte@myowntraining.dev   / senha123  (suporte)
--   financeiro@myowntraining.dev/ senha123  (financeiro)
--   ana@myowntraining.dev       / senha123  (personal trainer)
--   rafael@myowntraining.dev    / senha123  (personal trainer)
--   camila@myowntraining.dev    / senha123  (personal trainer)
--   cliente1@myowntraining.dev  / senha123  (cliente)
--   cliente2@myowntraining.dev  / senha123  (cliente)
--
-- O seed roda como postgres (superuser), então ignora RLS.
-- Para o projeto remoto use: npm run seed:remote
-- ============================================================

-- ============================================================
-- 1. USUÁRIOS DE AUTENTICAÇÃO (auth.users)
--    uuid de cada usuário é fixo/descritivo para facilitar FK.
-- ============================================================

-- ..........0001 admin
insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, last_sign_in_at
) values (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000001',
    'authenticated', 'authenticated',
    'admin@myowntraining.dev',
    extensions.crypt('senha123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin Master"}',
    now(), now(), now()
) on conflict (id) do nothing;

-- ..........0002 suporte
insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, last_sign_in_at
) values (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000002',
    'authenticated', 'authenticated',
    'suporte@myowntraining.dev',
    extensions.crypt('senha123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Suporte"}',
    now(), now(), now()
) on conflict (id) do nothing;

-- ..........0003 financeiro
insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, last_sign_in_at
) values (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000003',
    'authenticated', 'authenticated',
    'financeiro@myowntraining.dev',
    extensions.crypt('senha123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Financeiro"}',
    now(), now(), now()
) on conflict (id) do nothing;

-- ..........0004 Ana Pereira (personal trainer)
insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, last_sign_in_at
) values (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000004',
    'authenticated', 'authenticated',
    'ana@myowntraining.dev',
    extensions.crypt('senha123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Ana Pereira"}',
    now(), now(), now()
) on conflict (id) do nothing;

-- ..........0005 Rafael Souza (personal trainer)
insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, last_sign_in_at
) values (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000005',
    'authenticated', 'authenticated',
    'rafael@myowntraining.dev',
    extensions.crypt('senha123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Rafael Souza"}',
    now(), now(), now()
) on conflict (id) do nothing;

-- ..........0006 Camila Oliveira (personal trainer)
insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, last_sign_in_at
) values (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000006',
    'authenticated', 'authenticated',
    'camila@myowntraining.dev',
    extensions.crypt('senha123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Camila Oliveira"}',
    now(), now(), now()
) on conflict (id) do nothing;

-- ..........0007 João da Silva (cliente)
insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, last_sign_in_at
) values (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000007',
    'authenticated', 'authenticated',
    'cliente1@myowntraining.dev',
    extensions.crypt('senha123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"João da Silva"}',
    now(), now(), now()
) on conflict (id) do nothing;

-- ..........0008 Maria Souza (cliente)
insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, last_sign_in_at
) values (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-4000-8000-000000000008',
    'authenticated', 'authenticated',
    'cliente2@myowntraining.dev',
    extensions.crypt('senha123', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Maria Souza"}',
    now(), now(), now()
) on conflict (id) do nothing;

-- ============================================================
-- 2. PAPÉIS (papeis_usuario) — fonte de verdade de autorização
-- ============================================================

insert into papeis_usuario (id, usuario_id, papel) values
    ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'admin'),
    ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'suporte'),
    ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', 'financeiro'),
    ('00000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000004', 'usuario'),
    ('00000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000005', 'usuario'),
    ('00000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000006', 'usuario'),
    ('00000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000007', 'usuario'),
    ('00000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000008', 'usuario')
on conflict (usuario_id, papel) do nothing;

-- ============================================================
-- 3. USUÁRIOS ADMINISTRATIVOS (usuarios_admin2) — usado pelo app
-- ============================================================

insert into usuarios_admin2 (id, usuario_id) values
    ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001'),
    ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002'),
    ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003')
on conflict (usuario_id) do nothing;

-- ============================================================
-- 4. PERFIS DE CLIENTES (perfis_cliente)
-- ============================================================

insert into perfis_cliente (
    id, usuario_id, nome_completo, telefone, cidade, uf, cep, bairro,
    logradouro, numero, complemento, latitude, longitude
) values
    (
        '10000000-0000-4000-8000-000000000007',
        '00000000-0000-4000-8000-000000000007',
        'João da Silva', '(11) 98888-0001', 'São Paulo', 'SP', '01310-100',
        'Bela Vista', 'Av. Paulista', '1000', 'Apto 42', -23.5614, -46.6559
    ),
    (
        '10000000-0000-4000-8000-000000000008',
        '00000000-0000-4000-8000-000000000008',
        'Maria Souza', '(11) 97777-0002', 'São Paulo', 'SP', '04018-010',
        'Vila Mariana', 'Rua Domingos de Morais', '1800', null, -23.5890, -46.6390
    )
on conflict (id) do nothing;

-- ============================================================
-- 5. PERFIS DE PERSONAL TRAINER (perfis_personal_trainer)
--    Dados dos personal trainers exibidos na busca (SP)
-- ============================================================

insert into perfis_personal_trainer (
    id, usuario_id, nome_completo, telefone, bio, cidade, uf, cep, bairro,
    logradouro, numero, complemento, latitude, longitude, raio_atendimento_km,
    especialidades, equipamentos, preco_por_hora, preco_por_aula, numero_cref,
    avaliacao, total_avaliacoes, ativo, premium, disponibilidade
) values
    (
        '10000000-0000-4000-8000-000000000004',
        '00000000-0000-4000-8000-000000000004',
        'Ana Pereira', '(11) 96666-0004',
        'Personal trainer focada em funcional e mobilidade, atendimento próximo ao seu bairro.',
        'São Paulo', 'SP', '01000-000', 'Centro', 'Rua Augusta', '2500', null,
        -23.5505, -46.6333, 10,
        array['Funcional','Mobilidade'], array['TRX','Kettlebell','Colchonete'],
        95, 120, 'CREF 123456-G/SP',
        4.9, 47, true, true,
        '[{"dia":1,"inicio":"06:00","fim":"12:00"},{"dia":3,"inicio":"06:00","fim":"12:00"},{"dia":5,"inicio":"06:00","fim":"12:00"}]'::jsonb
    ),
    (
        '10000000-0000-4000-8000-000000000005',
        '00000000-0000-4000-8000-000000000005',
        'Rafael Souza', '(11) 95555-0005',
        'Especialista em musculação e treino em grupo, hipertrofia e performance.',
        'São Paulo', 'SP', '04101-000', 'Vila Mariana', 'Av. Lins de Vasconcelos', '3400', null,
        -23.5868, -46.6341, 8,
        array['Musculação','Treino em grupo'], array['Halteres','Barras','Anilhas'],
        110, 140, 'CREF 234567-G/SP',
        4.8, 32, true, false,
        '[{"dia":2,"inicio":"17:00","fim":"22:00"},{"dia":4,"inicio":"17:00","fim":"22:00"}]'::jsonb
    ),
    (
        '10000000-0000-4000-8000-000000000006',
        '00000000-0000-4000-8000-000000000006',
        'Camila Oliveira', '(11) 94444-0006',
        'Pilates e mobilidade com foco em qualidade de vida e prevenção de lesões.',
        'São Paulo', 'SP', '04077-000', 'Moema', 'Av. Ibirapuera', '2907', null,
        -23.6062, -46.6620, 7,
        array['Pilates','Mobilidade'], array['Reformer','Bola suíça','Faixas elásticas'],
        125, 150, 'CREF 345678-G/SP',
        5.0, 61, true, true,
        '[{"dia":1,"inicio":"08:00","fim":"14:00"},{"dia":4,"inicio":"08:00","fim":"14:00"}]'::jsonb
    )
on conflict (id) do nothing;

-- ============================================================
-- 6. CARTEIRAS (carteiras)
-- ============================================================

insert into carteiras (id, usuario_id, saldo_disponivel, saldo_pendente) values
    ('20000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000004', 1284.00, 95.00),
    ('20000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000005', 540.00, 0),
    ('20000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000006', 890.50, 110.00),
    ('20000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000007', 200.00, 0)
on conflict (id) do nothing;

-- ============================================================
-- 7. CÓDIGOS DE INDICAÇÃO (indicacoes_codigo)
-- ============================================================

insert into indicacoes_codigo (id, usuario_id, codigo, ativo, quantidade_usos) values
    ('30000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000007', 'JOAO10', true, 1),
    ('30000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000004', 'ANA-FIT', true, 0)
on conflict (id) do nothing;

-- ============================================================
-- 8. DOCUMENTOS CREF (documentos_cref)
-- ============================================================

insert into documentos_cref (
    id, personal_id, numero_cref, url_documento, status,
    revisado_por, revisado_em, observacoes
) values
    (
        '40000000-0000-4000-8000-000000000004',
        '10000000-0000-4000-8000-000000000004',
        'CREF 123456-G/SP', 'https://storage.example.com/cref/ana.pdf',
        'aprovado', '00000000-0000-4000-8000-000000000001', now(), 'Documento válido'
    ),
    (
        '40000000-0000-4000-8000-000000000005',
        '10000000-0000-4000-8000-000000000005',
        'CREF 234567-G/SP', 'https://storage.example.com/cref/rafael.pdf',
        'aprovado', '00000000-0000-4000-8000-000000000001', now(), 'Documento válido'
    ),
    (
        '40000000-0000-4000-8000-000000000006',
        '10000000-0000-4000-8000-000000000006',
        'CREF 345678-G/SP', 'https://storage.example.com/cref/camila.pdf',
        'aprovado', '00000000-0000-4000-8000-000000000002', now(), 'Documento válido'
    )
on conflict (id) do nothing;

-- ============================================================
-- 9. AGENDAMENTOS RECORRENTES (agendamentos_recorrentes)
-- ============================================================

insert into agendamentos_recorrentes (
    id, cliente_id, personal_id, dia_semana, hora_inicio, duracao_minutos,
    local, data_inicio, data_fim, ativo
) values (
    '50000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000007',
    '10000000-0000-4000-8000-000000000004',
    1, '07:00', 60, 'Parque do Ibirapuera',
    '2026-09-01', '2026-12-01', true
) on conflict (id) do nothing;

-- ============================================================
-- 10. AGENDAMENTOS (agendamentos)
-- ============================================================

insert into agendamentos (
    id, cliente_id, personal_id, recorrencia_id, agendado_para,
    duracao_minutos, local, status, observacoes,
    subtotal, desconto, taxa_plataforma, valor_personal, total
) values
    (
        '60000000-0000-4000-8000-000000000001',
        '10000000-0000-4000-8000-000000000007',
        '10000000-0000-4000-8000-000000000004',
        '50000000-0000-4000-8000-000000000001',
        '2026-09-07 07:00:00-03', 60, 'Parque do Ibirapuera',
        'concluido', null, 95, 0, 14.25, 80.75, 95
    ),
    (
        '60000000-0000-4000-8000-000000000002',
        '10000000-0000-4000-8000-000000000007',
        '10000000-0000-4000-8000-000000000004',
        '50000000-0000-4000-8000-000000000001',
        '2026-09-14 07:00:00-03', 60, 'Parque do Ibirapuera',
        'confirmado', null, 95, 0, 14.25, 80.75, 95
    ),
    (
        '60000000-0000-4000-8000-000000000003',
        '10000000-0000-4000-8000-000000000007',
        '10000000-0000-4000-8000-000000000005',
        null,
        '2026-09-16 18:30:00-03', 60, 'Academia Vila Mariana',
        'confirmado', 'Levar troca de roupa extra', 110, 0, 16.50, 93.50, 110
    ),
    (
        '60000000-0000-4000-8000-000000000004',
        '10000000-0000-4000-8000-000000000008',
        '10000000-0000-4000-8000-000000000006',
        null,
        '2026-09-10 09:00:00-03', 55, 'Studio Camila Oliveira',
        'concluido', null, 125, 0, 18.75, 106.25, 125
    ),
    (
        '60000000-0000-4000-8000-000000000005',
        '10000000-0000-4000-8000-000000000008',
        '10000000-0000-4000-8000-000000000004',
        null,
        '2026-09-12 07:00:00-03', 60, 'Parque do Ibirapuera',
        'cancelado', 'Cliente cancelou por imprevisto', 95, 0, 0, 0, 95
    )
on conflict (id) do nothing;

-- ============================================================
-- 11. TRANSAÇÕES DE CARTEIRA (transacoes_carteira)
-- ============================================================

insert into transacoes_carteira (
    id, carteira_id, agendamento_id, valor, tipo, status, descricao
) values
    (
        '70000000-0000-4000-8000-000000000001',
        '20000000-0000-4000-8000-000000000004',
        '60000000-0000-4000-8000-000000000001',
        80.75, 'credito', 'concluida', 'Repasse do agendamento de João da Silva'
    ),
    (
        '70000000-0000-4000-8000-000000000002',
        '20000000-0000-4000-8000-000000000004',
        null,
        500.00, 'saque', 'concluida', 'Saque para conta bancária'
    ),
    (
        '70000000-0000-4000-8000-000000000003',
        '20000000-0000-4000-8000-000000000005',
        '60000000-0000-4000-8000-000000000003',
        93.50, 'credito', 'pendente', 'Repasse do agendamento de João da Silva'
    ),
    (
        '70000000-0000-4000-8000-000000000004',
        '20000000-0000-4000-8000-000000000006',
        '60000000-0000-4000-8000-000000000004',
        106.25, 'credito', 'concluida', 'Repasse do agendamento de Maria Souza'
    )
on conflict (id) do nothing;

-- ============================================================
-- 12. FAVORITOS (favoritos)
-- ============================================================

insert into favoritos (id, cliente_id, personal_id) values
    ('80000000-0000-4000-8000-000000000001',
     '10000000-0000-4000-8000-000000000007',
     '10000000-0000-4000-8000-000000000004'),
    ('80000000-0000-4000-8000-000000000002',
     '10000000-0000-4000-8000-000000000007',
     '10000000-0000-4000-8000-000000000006')
on conflict (id) do nothing;

-- ============================================================
-- 13. NOTIFICAÇÕES (notificacoes)
-- ============================================================

insert into notificacoes (id, usuario_id, titulo, corpo, tipo, dados, lida_em) values
    (
        '90000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000007',
        'Agendamento confirmado',
        'Seu treino com Ana Pereira foi confirmado.',
        'agendamento',
        '{"agendamento_id":"60000000-0000-4000-8000-000000000002"}'::jsonb,
        null
    ),
    (
        '90000000-0000-4000-8000-000000000002',
        '00000000-0000-4000-8000-000000000004',
        'Novo agendamento',
        'Você tem um novo agendamento com João da Silva.',
        'agendamento',
        '{"agendamento_id":"60000000-0000-4000-8000-000000000002"}'::jsonb,
        '2026-09-08 08:00:00-03'
    )
on conflict (id) do nothing;

-- ============================================================
-- 14. CHAMADOS E MENSAGENS DE SUPORTE
-- ============================================================

insert into chamados_suporte (
    id, usuario_id, assunto, categoria, prioridade, status
) values (
    'a0000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000007',
    'Dúvida sobre pagamento', 'financeiro', 'media', 'em_andamento'
) on conflict (id) do nothing;

insert into mensagens_suporte (id, chamado_id, usuario_id, mensagem, anexos) values
    (
        'b0000000-0000-4000-8000-000000000001',
        'a0000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000007',
        'Olá, não recebi a confirmação do pagamento do agendamento de hoje.',
        null
    ),
    (
        'b0000000-0000-4000-8000-000000000002',
        'a0000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000001',
        'Olá João, verificamos e o pagamento foi confirmado. Qualquer dúvida estamos à disposição.',
        null
    )
on conflict (id) do nothing;

-- ============================================================
-- 15. RECOMPENSAS DE INDICAÇÃO (indicacoes_recompensas)
-- ============================================================

insert into indicacoes_recompensas (
    id, codigo_indicacao_id, usuario_indicado_id, valor_recompensa, status
) values (
    'c0000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000007',
    '00000000-0000-4000-8000-000000000008',
    20.00, 'pendente'
) on conflict (id) do nothing;

-- ============================================================
-- 16. RANKINGS PERSONAIS (rankings_personais)
-- ============================================================

insert into rankings_personais (
    id, personal_id, pontuacao, posicao, periodo, modalidade, cidade, bairro
) values
    (
        'd0000000-0000-4000-8000-000000000001',
        '10000000-0000-4000-8000-000000000004',
        4850.50, 1, '2026-07', 'Funcional', 'São Paulo', 'Centro'
    ),
    (
        'd0000000-0000-4000-8000-000000000002',
        '10000000-0000-4000-8000-000000000005',
        4120.00, 2, '2026-07', 'Musculação', 'São Paulo', 'Vila Mariana'
    ),
    (
        'd0000000-0000-4000-8000-000000000003',
        '10000000-0000-4000-8000-000000000006',
        3890.00, 3, '2026-07', 'Pilates', 'São Paulo', 'Moema'
    )
on conflict (id) do nothing;