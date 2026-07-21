# Entidades do sistema
1. Usuário(auth.user)
*Descrição*: Usuários do sistema autenticados pelo banco de dados(Supabase)

2. Usuários com perfil Admin(admin_users)
- *Descrição*: Usuários com acesso administrativo (admin, suporte, financeiro).
- *Atributos Principais*: 
    - id, 
    - user_id --> referencia Usuário(auth.user)
    - email
    - role --> papel
3. Perfis de profissionais (professional_profiles)

    Descrição: Dados do profissional (personal trainer) que oferece serviços.

    Atributos principais:

        id (identificador único)

        user_id → auth.users

        full_name, phone, bio

        city, neighborhood, latitude, longitude

        specialties (especialidades, array)

        equipment (equipamentos, array)

        price_per_hour, lesson_price (preço por hora/aula)

        cref_number, cref_verified (número do CREF e se está verificado)

        rating, total_reviews (avaliação média e total de avaliações)

        is_active, premium

        availability (disponibilidade semanal, provavelmente JSON)

    Relacionamentos:

        user_id → auth.users (1:1)

        Um profissional pode ter várias reservas (bookings, recurring_bookings)

        Um profissional pode ter vários documentos CREF (cref_documents)

        Um profissional aparece em rankings (trainer_rankings)

        Um profissional pode ser favoritado por clientes (favorites)

4. Reservas (bookings)

    Descrição: Sessão de treino agendada entre um cliente e um profissional.

    Atributos principais:

        id

        client_id → client_profiles.id

        trainer_id → professional_profiles.id

        scheduled_at (data/hora agendada)

        duration_minutes (duração em minutos)

        quantity (quantidade de sessões)

        location (local da aula)

        status (estado da reserva)

        subtotal, discount, platform_fee, trainer_receives, total (valores financeiros)

        notes (observações)

    Relacionamentos (implícitos, sem FK explícita no tipos):

        client_id → client_profiles.id (um cliente possui várias reservas)

        trainer_id → professional_profiles.id (um profissional possui várias reservas)

        Uma reserva pode gerar transações na carteira (wallet_transactions)

5. Reservas recorrentes (recurring_bookings)

    Descrição: Agendamento semanal recorrente, sem data específica.

    Atributos principais:

        id

        client_id → client_profiles.id

        trainer_id → professional_profiles.id

        weekday (dia da semana, número)

        start_time (horário de início)

        duration_minutes

        location

        active (se está ativo)

    Relacionamentos:

        client_id → client_profiles.id

        trainer_id → professional_profiles.id

6. Favoritos (favorites)

    Descrição: Tabela associativa que marca os profissionais favoritos de um cliente.

    Atributos:

        id

        client_id → client_profiles.id

        trainer_id → professional_profiles.id

    Relacionamentos:

        client_id → client_profiles.id (um cliente tem N favoritos)

        trainer_id → professional_profiles.id (um profissional pode ser favorito de N clientes)

        Representa um relacionamento N:N entre cliente e profissional.

7. Documentos CREF (cref_documents)

    Descrição: Documentos enviados para comprovação do registro no CREF.

    Atributos:

        id

        trainer_id → professional_profiles.id

        cref_number

        document_url

        status (ex.: pendente, aprovado, rejeitado)

        reviewed_by (quem revisou, provavelmente admin)

        reviewed_at

        notes

    Relacionamentos:

        trainer_id → professional_profiles.id (um profissional pode ter vários documentos)

        reviewed_by → admin_users.user_id ou auth.users (revisor)

8. Carteiras (wallets)

    Descrição: Carteira financeira de um usuário (cliente ou profissional).

    Atributos:

        id

        user_id → auth.users

        balance (saldo disponível)

        pending (saldo pendente)

    Relacionamentos:

        user_id → auth.users (cada usuário tem uma única carteira, 1:1)

        Uma carteira tem várias transações (wallet_transactions)

9. Transações da carteira (wallet_transactions)

    Descrição: Movimentação financeira na carteira (crédito, débito, estorno etc.).

    Atributos:

        id

        wallet_id → wallets.id (FK explícita)

        user_id → auth.users (dono da carteira)

        booking_id → bookings.id (FK explícita, pode ser nulo se não vinculado a uma reserva)

        amount (valor)

        type (tipo: crédito, débito, etc.)

        status (concluída, pendente, etc.)

        description

    Relacionamentos:

        wallet_id → wallets.id (uma transação pertence a uma carteira)

        booking_id → bookings.id (transação opcionalmente ligada a uma reserva)

10. Notificações (notifications)

    Descrição: Notificações enviadas aos usuários.

    Atributos:

        id

        user_id → auth.users

        title, body

        type

        read (lida ou não)

        data (JSON com dados extras)

    Relacionamentos:

        user_id → auth.users (um usuário tem várias notificações)

11. Códigos de indicação (referral_codes)

    Descrição: Código de indicação único por usuário.

    Atributos:

        id

        user_id → auth.users

        code (código alfanumérico)

        active (ativo/inativo)

        uses_count (quantos usos)

    Relacionamentos:

        user_id → auth.users (um usuário pode ter um código de indicação, 1:1)

        Um código pode gerar várias recompensas (referral_rewards)

12. Recompensas de indicação (referral_rewards)

    Descrição: Registro de recompensa concedida quando um novo usuário se cadastra usando um código de indicação.

    Atributos:

        id

        referrer_id → auth.users (quem indicou)

        referred_user_id → auth.users (quem foi indicado)

        code_id → referral_codes.id (FK explícita)

        reward_amount (valor da recompensa)

        status

    Relacionamentos:

        code_id → referral_codes.id (uma recompensa pertence a um código)

        referrer_id → auth.users

        referred_user_id → auth.users

13. Chamados de suporte (support_tickets)

    Descrição: Ticket de suporte aberto por um usuário.

    Atributos:

        id

        user_id → auth.users

        subject, category

        priority, status

    Relacionamentos:

        user_id → auth.users (um usuário pode abrir vários chamados)

        Um chamado tem várias mensagens (support_messages)

14. Mensagens de suporte (support_messages)

    Descrição: Mensagem individual dentro de um chamado de suporte.

    Atributos:

        id

        ticket_id → support_tickets.id (FK explícita)

        sender_id → auth.users (quem enviou)

        message

        attachments (JSON com anexos)

    Relacionamentos:

        ticket_id → support_tickets.id (um chamado tem várias mensagens)

        sender_id → auth.users (remetente da mensagem)

15. Rankings de treinadores (trainer_rankings)

    Descrição: Classificações (rankings) de profissionais, possivelmente por região e modalidade.

    Atributos:

        id

        trainer_id → professional_profiles.id

        score, position

        period (período do ranking)

        modality (modalidade)

        city, neighborhood (filtros regionais)

        computed_at

    Relacionamentos:

        trainer_id → professional_profiles.id

16. Papéis de usuário (user_roles)

    Descrição: Atribuição de papel (role) a um usuário autenticado.

    Atributos:

        id

        user_id → auth.users

        role → enum app_role (admin | support | finance | user)

    Relacionamentos:

        user_id → auth.users (um usuário pode ter um papel definido, complementar ao admin_users)