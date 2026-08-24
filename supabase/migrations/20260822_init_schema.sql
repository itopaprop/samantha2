-- ============================================================================
-- SAMANTHASAPPY HOME CARE & SERVICES - SUPABASE DATABASE & STORAGE SCHEMA
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/ikeglxdyjimmxvfbxrvb/sql
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. PROFILES (Users linked to Supabase Auth)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Staff', 'Resident Relative')),
  position TEXT,
  relationship TEXT,
  resident_linked_id TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to all profiles" ON public.profiles;

CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins have full access to all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- ----------------------------------------------------------------------------
-- 2. RESIDENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  date_of_birth TEXT,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  room_number TEXT,
  care_category TEXT NOT NULL,
  assigned_staff_id TEXT,
  assigned_staff_name TEXT,
  medical_notes TEXT,
  emergency_contact JSONB DEFAULT '{}'::jsonb,
  admission_date TEXT,
  health_status TEXT DEFAULT 'Stable',
  last_activity_update TEXT,
  avatar TEXT,
  "references" JSONB DEFAULT '[]'::jsonb,
  vitals JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_residents_care_category ON public.residents(care_category);
CREATE INDEX IF NOT EXISTS idx_residents_assigned_staff ON public.residents(assigned_staff_id);

ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view residents" ON public.residents;
DROP POLICY IF EXISTS "Staff and Admins can insert residents" ON public.residents;
DROP POLICY IF EXISTS "Staff and Admins can update residents" ON public.residents;
DROP POLICY IF EXISTS "Admins can delete residents" ON public.residents;

CREATE POLICY "Authenticated users can view residents"
  ON public.residents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff and Admins can insert residents"
  ON public.residents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Staff')
    )
  );

CREATE POLICY "Staff and Admins can update residents"
  ON public.residents FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Staff')
    )
  );

CREATE POLICY "Admins can delete residents"
  ON public.residents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- ----------------------------------------------------------------------------
-- 3. STAFF
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  shift TEXT DEFAULT 'Morning (07:00 - 15:30)',
  role TEXT DEFAULT 'Staff' CHECK (role IN ('Staff', 'Admin')),
  join_date TEXT,
  qualification TEXT,
  assigned_residents_count INTEGER DEFAULT 0,
  avatar TEXT,
  "references" JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(email);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view staff list" ON public.staff;
DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff;

CREATE POLICY "Authenticated users can view staff list"
  ON public.staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage staff"
  ON public.staff FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- ----------------------------------------------------------------------------
-- 4. SHIFTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  shift_date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  shift_type TEXT NOT NULL,
  location TEXT DEFAULT 'Main Facility',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shifts_staff_id ON public.shifts(staff_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON public.shifts(shift_date);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view shifts" ON public.shifts;
DROP POLICY IF EXISTS "Admins can manage shifts" ON public.shifts;

CREATE POLICY "Authenticated users can view shifts"
  ON public.shifts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage shifts"
  ON public.shifts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- ----------------------------------------------------------------------------
-- 5. MESSAGES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  receiver_role TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  attachment_name TEXT,
  attachment_url TEXT,
  applicant_photo_url TEXT,
  "references" JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages sent to them, sent by them, or if Admin" ON public.messages;
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update read status on their received messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can delete messages" ON public.messages;

CREATE POLICY "Users can view messages sent to them, sent by them, or if Admin"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    receiver_id = auth.uid()::text 
    OR sender_id = auth.uid()::text 
    OR receiver_role = 'Admin'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin')
  );

CREATE POLICY "Authenticated users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update read status on their received messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (receiver_id = auth.uid()::text OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

CREATE POLICY "Admins can delete messages"
  ON public.messages FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

-- ----------------------------------------------------------------------------
-- 6. ACTIVITY LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  performer TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Authenticated users can insert activity logs" ON public.activity_logs;

CREATE POLICY "Authenticated users can view activity logs"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activity logs"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 7. COMMUNITY EVENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'Upcoming',
  organizer TEXT DEFAULT 'Care Team',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view community events" ON public.community_events;
DROP POLICY IF EXISTS "Admins can manage community events" ON public.community_events;

CREATE POLICY "Public can view community events"
  ON public.community_events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage community events"
  ON public.community_events FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

-- ----------------------------------------------------------------------------
-- 8. JOB VACANCIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.job_vacancies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view job vacancies" ON public.job_vacancies;
DROP POLICY IF EXISTS "Admins can manage job vacancies" ON public.job_vacancies;

CREATE POLICY "Public can view job vacancies"
  ON public.job_vacancies FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage job vacancies"
  ON public.job_vacancies FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

-- ----------------------------------------------------------------------------
-- 9. GALLERY ITEMS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  video_url TEXT,
  media_type TEXT DEFAULT 'image',
  description TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view gallery items" ON public.gallery_items;
DROP POLICY IF EXISTS "Admins can manage gallery items" ON public.gallery_items;

CREATE POLICY "Public can view gallery items"
  ON public.gallery_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage gallery items"
  ON public.gallery_items FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

-- ----------------------------------------------------------------------------
-- 10. APPLICATIONS (Job Applications & Resident Care Admission Requests)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('caregiver', 'resident')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  photo_url TEXT,
  position_or_category TEXT NOT NULL,
  notes_or_statement TEXT,
  sponsor_name TEXT,
  "references" JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'Received' CHECK (status IN ('Received', 'Under Review', 'Approved', 'Declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit applications" ON public.applications;
DROP POLICY IF EXISTS "Staff and Admins can view applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.applications;
DROP POLICY IF EXISTS "Admins can delete applications" ON public.applications;

CREATE POLICY "Public can submit applications"
  ON public.applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Staff and Admins can view applications"
  ON public.applications FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Staff')));

CREATE POLICY "Admins can update applications"
  ON public.applications FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

CREATE POLICY "Admins can delete applications"
  ON public.applications FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

-- ----------------------------------------------------------------------------
-- 11. CONSULTATION BOOKINGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consultation_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  service_interest TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can book consultations" ON public.consultation_bookings;
DROP POLICY IF EXISTS "Staff and Admins can view consultations" ON public.consultation_bookings;
DROP POLICY IF EXISTS "Admins can manage consultations" ON public.consultation_bookings;

CREATE POLICY "Public can book consultations"
  ON public.consultation_bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Staff and Admins can view consultations"
  ON public.consultation_bookings FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Staff')));

CREATE POLICY "Admins can manage consultations"
  ON public.consultation_bookings FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

-- ----------------------------------------------------------------------------
-- 12. STORAGE BUCKETS CONFIGURATION & POLICIES
-- ----------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('public-media', 'public-media', true),
  ('avatars', 'avatars', true),
  ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view public media" ON storage.objects;
DROP POLICY IF EXISTS "Staff and Admins can upload public media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete public media" ON storage.objects;

CREATE POLICY "Public can view public media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'public-media');

CREATE POLICY "Staff and Admins can upload public media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'public-media');

CREATE POLICY "Admins can delete public media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'public-media' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));

DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;

CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Public can upload application documents" ON storage.objects;
DROP POLICY IF EXISTS "Staff and Admins can view documents" ON storage.objects;

CREATE POLICY "Public can upload application documents"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Staff and Admins can view documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Staff')));

-- ----------------------------------------------------------------------------
-- 13. AUTH TRIGGER FOR AUTOMATIC PROFILE CREATION
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, position, avatar)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'Staff'),
    new.raw_user_meta_data->>'position',
    new.raw_user_meta_data->>'avatar'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Realtime on tables for live two-way synchronization
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.shifts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.residents;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.staff;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.consultation_bookings;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.community_events;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gallery_items;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;
