-- Enable pgcrypto extension for password hashing if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom enums
CREATE TYPE public.user_role AS ENUM ('player', 'team_manager', 'club_admin');
CREATE TYPE public.availability_response AS ENUM ('yes', 'no', 'maybe');

-- 1. Club Settings (e.g., global access password)
CREATE TABLE public.club_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default password (hashed or simple, let's support plain text check or blowfish crypt).
-- We'll use a simple blowfish hash for the default password 'Tischtennis2026'.
-- The application can also update this.
INSERT INTO public.club_settings (key, value)
VALUES ('club_password_hash', crypt('Tischtennis2026', gen_salt('bf', 8)))
ON CONFLICT (key) DO NOTHING;

-- 2. Profiles (extends auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role public.user_role NOT NULL DEFAULT 'player',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Teams
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    webcal_url TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed 3 teams initially
INSERT INTO public.teams (id, name, short_name, webcal_url, active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Herren I', 'Herren 1', 'webcal://www.mytischtennis.de/community/exportICSCalendar?teamIds=1111111', true),
  ('22222222-2222-2222-2222-222222222222', 'Herren II', 'Herren 2', 'webcal://www.mytischtennis.de/community/exportICSCalendar?teamIds=2222222', true),
  ('33333333-3333-3333-3333-333333333333', 'Herren III', 'Herren 3', 'webcal://www.mytischtennis.de/community/exportICSCalendar?teamIds=3142285', true)
ON CONFLICT DO NOTHING;

-- 4. Team Players (Many-to-Many map players to teams they can play for or are assigned to)
CREATE TABLE public.team_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, player_id)
);

-- 5. Matches
CREATE TABLE public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    external_uid TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    location TEXT,
    dtstart TIMESTAMPTZ NOT NULL,
    dtend TIMESTAMPTZ NOT NULL,
    is_home BOOLEAN NOT NULL DEFAULT true,
    matchday INTEGER,
    active BOOLEAN NOT NULL DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, external_uid)
);

-- 6. Availabilities
CREATE TABLE public.availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    response public.availability_response NOT NULL,
    comment TEXT,
    version_responded INTEGER NOT NULL, -- Stores the match version at the time of the response
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(match_id, player_id)
);

-- 7. Sync Runs
CREATE TABLE public.sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL, -- 'success', 'failed'
    summary_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Match Changes (to log date/time changes, etc.)
CREATE TABLE public.match_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    old_dtstart TIMESTAMPTZ,
    new_dtstart TIMESTAMPTZ,
    change_type TEXT NOT NULL, -- 'date_time_changed', 'cancelled', 'details_updated'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------
-- TRIGGERS & FUNCTIONS
-- ----------------------------------------------------

-- Automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_name TEXT;
BEGIN
    default_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
    INSERT INTO public.profiles (id, name, role)
    VALUES (new.id, default_name, 'player');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Password verification RPC helper
CREATE OR REPLACE FUNCTION public.verify_club_password(password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    stored_hash TEXT;
BEGIN
    SELECT value INTO stored_hash FROM public.club_settings WHERE key = 'club_password_hash';
    IF stored_hash IS NULL THEN
        -- Fallback to default if not exists
        RETURN false;
    END IF;
    RETURN stored_hash = crypt(password, stored_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is club admin
CREATE OR REPLACE FUNCTION public.is_club_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'club_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is team manager or admin
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('team_manager', 'club_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.club_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_changes ENABLE ROW LEVEL SECURITY;

-- 1. Club Settings RLS Policies
CREATE POLICY "Allow authenticated users to read club settings keys (excluding hashed password)"
    ON public.club_settings FOR SELECT
    USING (auth.role() = 'authenticated' AND key <> 'club_password_hash');

CREATE POLICY "Allow club admin full control over settings"
    ON public.club_settings FOR ALL
    USING (public.is_club_admin());

-- 2. Profiles RLS Policies
CREATE POLICY "Allow authenticated users to read all profiles"
    ON public.profiles FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own profile display name"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())); -- Prevent role change by normal user

CREATE POLICY "Allow club admin to manage all profiles"
    ON public.profiles FOR ALL
    USING (public.is_club_admin());

-- 3. Teams RLS Policies
CREATE POLICY "Allow authenticated users to read teams"
    ON public.teams FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow club admins to manage teams"
    ON public.teams FOR ALL
    USING (public.is_club_admin());

-- 4. Team Players RLS Policies
CREATE POLICY "Allow authenticated users to read team player mapping"
    ON public.team_players FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow team managers and admins to manage team players"
    ON public.team_players FOR ALL
    USING (public.is_manager_or_admin());

-- 5. Matches RLS Policies
CREATE POLICY "Allow authenticated users to read matches"
    ON public.matches FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins/system to write matches"
    ON public.matches FOR ALL
    USING (public.is_club_admin());

-- 6. Availabilities RLS Policies
CREATE POLICY "Allow authenticated users to read availabilities"
    ON public.availabilities FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to create/update their own availability"
    ON public.availabilities FOR ALL
    USING (auth.uid() = player_id)
    WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Allow team managers and admins to clean up or modify availability"
    ON public.availabilities FOR DELETE
    USING (public.is_manager_or_admin());

-- 7. Sync Runs RLS Policies
CREATE POLICY "Allow authenticated users to view sync runs"
    ON public.sync_runs FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins/system to manage sync runs"
    ON public.sync_runs FOR ALL
    USING (public.is_club_admin());

-- 8. Match Changes RLS Policies
CREATE POLICY "Allow authenticated users to view match changes"
    ON public.match_changes FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admins/system to manage match changes"
    ON public.match_changes FOR ALL
    USING (public.is_club_admin());

-- ----------------------------------------------------
-- SEED DUMMY ADMIN USER FOR TESTING
-- ----------------------------------------------------
DO $$
DECLARE
    v_user_id UUID := 'd0000000-0000-0000-0000-000000000001';
    v_encrypted_pw TEXT := crypt('AdminTT2026!', gen_salt('bf', 8));
BEGIN
    -- Insert into auth.users if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@tt-hsv.de') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'admin@tt-hsv.de',
            v_encrypted_pw,
            NOW(),
            '{"provider":"email","providers":["email"]}',
            '{"name": "Admin Dummy"}',
            NOW(),
            NOW()
        );

        -- Insert into auth.identities
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            v_user_id,
            format('{"sub": "%s", "email": "admin@tt-hsv.de"}', v_user_id)::jsonb,
            'email',
            v_user_id::text,
            NOW(),
            NOW(),
            NOW()
        );

        -- Update profile role to club_admin (since trigger created it with role = 'player')
        UPDATE public.profiles
        SET role = 'club_admin', name = 'Admin Dummy'
        WHERE id = v_user_id;
    END IF;
END;
$$;
