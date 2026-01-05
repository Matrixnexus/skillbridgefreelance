-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'freelancer');

-- Create enum for membership tiers
CREATE TYPE public.membership_tier AS ENUM ('none', 'regular', 'pro', 'vip');

-- Create enum for job difficulty
CREATE TYPE public.job_difficulty AS ENUM ('easy', 'medium', 'hard');

-- Create enum for submission status
CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  membership_tier membership_tier NOT NULL DEFAULT 'none',
  membership_expires_at TIMESTAMPTZ,
  daily_tasks_used INTEGER NOT NULL DEFAULT 0,
  last_task_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  pending_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  approved_earnings DECIMAL(10,2) NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create job_categories table
CREATE TABLE public.job_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  job_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create jobs table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT NOT NULL,
  category_id UUID REFERENCES public.job_categories(id) ON DELETE SET NULL,
  difficulty job_difficulty NOT NULL DEFAULT 'easy',
  payment_amount DECIMAL(10,2) NOT NULL,
  required_tier membership_tier NOT NULL DEFAULT 'regular',
  estimated_time TEXT,
  deadline TIMESTAMPTZ,
  submission_format TEXT,
  max_submissions INTEGER,
  current_submissions INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create job_submissions table
CREATE TABLE public.job_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  submission_content TEXT NOT NULL,
  submission_url TEXT,
  status submission_status NOT NULL DEFAULT 'pending',
  admin_feedback TEXT,
  payment_amount DECIMAL(10,2) NOT NULL,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id, user_id)
);

-- Create transactions table for payment history
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'subscription', 'earning', 'payout'
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  
  -- Assign freelancer role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'freelancer');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_job_submissions_updated_at
  BEFORE UPDATE ON public.job_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for job_categories (public read)
CREATE POLICY "Anyone can view categories"
  ON public.job_categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.job_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for jobs
CREATE POLICY "Anyone can view active jobs"
  ON public.jobs FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage all jobs"
  ON public.jobs FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for job_submissions
CREATE POLICY "Users can view own submissions"
  ON public.job_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions"
  ON public.job_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending submissions"
  ON public.job_submissions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all submissions"
  ON public.job_submissions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all submissions"
  ON public.job_submissions FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions"
  ON public.transactions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications"
  ON public.notifications FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Insert default job categories
INSERT INTO public.job_categories (name, description, icon) VALUES
  ('Data Entry', 'Input and organize data accurately', 'Database'),
  ('Web Research', 'Find and compile information online', 'Search'),
  ('Content Writing', 'Create engaging written content', 'FileText'),
  ('Copywriting', 'Write persuasive marketing copy', 'PenTool'),
  ('Proofreading', 'Review and correct text errors', 'CheckCircle'),
  ('Transcription', 'Convert audio to written text', 'Headphones'),
  ('Translation', 'Translate content between languages', 'Languages'),
  ('Graphic Design', 'Create visual designs and graphics', 'Palette'),
  ('Logo Design', 'Design brand logos and marks', 'Shapes'),
  ('Video Editing', 'Edit and enhance video content', 'Video'),
  ('Social Media', 'Manage social media accounts', 'Share2'),
  ('SEO Tasks', 'Optimize content for search engines', 'TrendingUp'),
  ('Email Marketing', 'Create email campaigns', 'Mail'),
  ('Virtual Assistance', 'Provide remote admin support', 'UserCheck'),
  ('Product Listing', 'Create product descriptions', 'ShoppingBag'),
  ('Lead Generation', 'Find and qualify leads', 'Target'),
  ('Surveys', 'Complete research surveys', 'ClipboardList'),
  ('AI Data Labeling', 'Label data for AI training', 'Brain'),
  ('Image Annotation', 'Tag and annotate images', 'Image'),
  ('Software Testing', 'Test software applications', 'Bug'),
  ('UX Feedback', 'Provide user experience feedback', 'MessageSquare'),
  ('Customer Support', 'Handle customer inquiries', 'Headphones');