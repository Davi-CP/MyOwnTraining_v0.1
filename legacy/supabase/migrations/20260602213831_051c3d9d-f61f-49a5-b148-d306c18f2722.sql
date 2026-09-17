
ALTER TABLE public.admin_users ADD COLUMN IF NOT EXISTS email text;

DO $$
DECLARE
  r record;
  fks text[][] := ARRAY[
    ['professional_profiles','professional_profiles_user_id_fkey','user_id','auth.users','id','CASCADE'],
    ['admin_users','admin_users_user_id_fkey','user_id','auth.users','id','CASCADE'],
    ['admin_users','admin_users_created_by_fkey','created_by','auth.users','id','SET NULL'],
    ['user_roles','user_roles_user_id_fkey','user_id','auth.users','id','CASCADE'],
    ['wallets','wallets_user_id_fkey','user_id','auth.users','id','CASCADE'],
    ['wallet_transactions','wallet_transactions_user_id_fkey','user_id','auth.users','id','CASCADE'],
    ['notifications','notifications_user_id_fkey','user_id','auth.users','id','CASCADE'],
    ['support_tickets','support_tickets_user_id_fkey','user_id','auth.users','id','CASCADE'],
    ['support_messages','support_messages_sender_id_fkey','sender_id','auth.users','id','CASCADE'],
    ['referral_codes','referral_codes_user_id_fkey','user_id','auth.users','id','CASCADE'],
    ['referral_rewards','referral_rewards_referrer_id_fkey','referrer_id','auth.users','id','CASCADE'],
    ['referral_rewards','referral_rewards_referred_user_id_fkey','referred_user_id','auth.users','id','CASCADE'],
    ['favorites','favorites_client_id_fkey','client_id','auth.users','id','CASCADE'],
    ['favorites','favorites_trainer_id_fkey','trainer_id','auth.users','id','CASCADE'],
    ['bookings','bookings_client_id_fkey','client_id','auth.users','id','CASCADE'],
    ['bookings','bookings_trainer_id_fkey','trainer_id','auth.users','id','CASCADE'],
    ['recurring_bookings','recurring_bookings_client_id_fkey','client_id','auth.users','id','CASCADE'],
    ['recurring_bookings','recurring_bookings_trainer_id_fkey','trainer_id','auth.users','id','CASCADE'],
    ['cref_documents','cref_documents_trainer_id_fkey','trainer_id','auth.users','id','CASCADE'],
    ['cref_documents','cref_documents_reviewed_by_fkey','reviewed_by','auth.users','id','SET NULL'],
    ['trainer_rankings','trainer_rankings_trainer_id_fkey','trainer_id','auth.users','id','CASCADE']
  ];
  i int;
BEGIN
  FOR i IN 1..array_length(fks,1) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = fks[i][2]) THEN
      EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %s(%I) ON DELETE %s',
        fks[i][1], fks[i][2], fks[i][3], fks[i][4], fks[i][5], fks[i][6]);
    END IF;
  END LOOP;
END $$;
