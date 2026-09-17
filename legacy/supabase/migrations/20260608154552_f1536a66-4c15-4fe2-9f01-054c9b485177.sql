
-- Trigger to auto-create client_profiles or professional_profiles on signup,
-- driven by raw_user_meta_data.role ('client' | 'pro').
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  v_name text := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1));
  v_phone text := NEW.raw_user_meta_data->>'phone';
  v_city text := NEW.raw_user_meta_data->>'city';
  v_avatar text := NEW.raw_user_meta_data->>'avatar_url';
BEGIN
  IF v_role = 'pro' THEN
    INSERT INTO public.professional_profiles (user_id, full_name, phone, city, avatar_url, bio, cref_number, lesson_price)
    VALUES (
      NEW.id, v_name, v_phone, v_city, v_avatar,
      NEW.raw_user_meta_data->>'bio',
      NEW.raw_user_meta_data->>'cref_number',
      NULLIF(NEW.raw_user_meta_data->>'lesson_price','')::numeric
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- wallet for pro
    INSERT INTO public.wallets (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    INSERT INTO public.client_profiles (user_id, full_name, phone, city, avatar_url)
    VALUES (NEW.id, v_name, v_phone, v_city, v_avatar)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  -- default app role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure user_id uniqueness on profiles so ON CONFLICT works
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'client_profiles_user_id_key') THEN
    ALTER TABLE public.client_profiles ADD CONSTRAINT client_profiles_user_id_key UNIQUE (user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'professional_profiles_user_id_key') THEN
    ALTER TABLE public.professional_profiles ADD CONSTRAINT professional_profiles_user_id_key UNIQUE (user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wallets_user_id_key') THEN
    ALTER TABLE public.wallets ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);
  END IF;
END$$;
