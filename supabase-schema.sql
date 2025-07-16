-- LucRun Database Schema
-- Run this script in your Supabase SQL Editor

-- Create custom types
CREATE TYPE training_session_type AS ENUM ('speed', 'recovery', 'long-run', 'interval', 'tempo');
CREATE TYPE video_category AS ENUM ('technique', 'training', 'nutrition', 'recovery');
CREATE TYPE program_type AS ENUM ('beginner', '5k-10k', 'semi-marathon', 'marathon', 'trail-running', 'ultra-trail');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    
    -- Personal Information
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    date_of_birth DATE,
    
    -- Address Information
    street TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    
    -- Connected Accounts
    strava_account TEXT,
    garmin_account TEXT,
    
    -- Training Schedule (stored as JSON array)
    training_days JSONB DEFAULT '[]'::jsonb,
    
    -- Running Information
    training_hours_per_week TEXT,
    running_level TEXT,
    current_weekly_km TEXT,
    longest_distance TEXT,
    recent_5k_time TEXT,
    recent_10k_time TEXT,
    
    -- Equipment (stored as JSON array)
    equipment JSONB DEFAULT '[]'::jsonb,
    
    -- Health Information
    has_injury BOOLEAN DEFAULT FALSE,
    injury_details TEXT,
    
    -- Device Information
    has_smartwatch BOOLEAN DEFAULT FALSE,
    smartwatch_type TEXT,
    
    -- Profile completion tracking
    profile_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Health Survey table
CREATE TABLE health_surveys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Health Questions (all boolean)
    family_cardiac_death BOOLEAN,
    chest_pain_palpitations BOOLEAN,
    asthma_wheezing BOOLEAN,
    loss_of_consciousness BOOLEAN,
    muscle_joint_pain BOOLEAN,
    regular_medications BOOLEAN,
    medical_prescription BOOLEAN,
    exercise_induced_pain BOOLEAN,
    pregnancy_recent_birth BOOLEAN,
    
    -- Medical Certificate
    has_medical_certificate BOOLEAN DEFAULT FALSE,
    medical_certificate_url TEXT,
    medical_certificate_filename TEXT,
    
    -- Survey completion
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Training Programs table
CREATE TABLE training_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program_type program_type NOT NULL,
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    duration TEXT NOT NULL,
    frequency TEXT NOT NULL,
    price TEXT NOT NULL,
    color TEXT DEFAULT 'blue',
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Program Enrollments table
CREATE TABLE user_program_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    program_id UUID REFERENCES training_programs(id) ON DELETE CASCADE NOT NULL,
    
    -- Enrollment details
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(user_id, program_id)
);

-- Training Sessions table
CREATE TABLE training_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Session details
    title TEXT NOT NULL,
    session_type training_session_type NOT NULL,
    session_date DATE NOT NULL,
    session_time TIME,
    duration_minutes INTEGER,
    description TEXT,
    
    -- Completion tracking
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Session feedback
    has_constraints BOOLEAN DEFAULT FALSE,
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10), -- Rate of Perceived Exertion
    comments TEXT,
    
    -- Program association (optional)
    program_enrollment_id UUID REFERENCES user_program_enrollments(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Training Videos table
CREATE TABLE training_videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Video details
    title TEXT NOT NULL,
    description TEXT,
    duration_seconds INTEGER NOT NULL,
    thumbnail_url TEXT,
    video_url TEXT,
    category video_category NOT NULL,
    
    -- Video metadata
    is_premium BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Video Progress table
CREATE TABLE user_video_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    video_id UUID REFERENCES training_videos(id) ON DELETE CASCADE NOT NULL,
    
    -- Progress tracking
    watched_duration_seconds INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(user_id, video_id)
);

-- Dashboard Progress table (for onboarding checklist)
CREATE TABLE dashboard_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Completion tracking
    profile_completed BOOLEAN DEFAULT FALSE,
    health_survey_completed BOOLEAN DEFAULT FALSE,
    program_selected BOOLEAN DEFAULT FALSE,
    calendar_setup BOOLEAN DEFAULT FALSE,
    videos_unlocked BOOLEAN DEFAULT FALSE,
    
    -- Progress percentage
    overall_progress INTEGER DEFAULT 0 CHECK (overall_progress >= 0 AND overall_progress <= 100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    UNIQUE(user_id)
);

-- Insert default training programs
INSERT INTO training_programs (program_type, title, subtitle, description, duration, frequency, price, color, features) VALUES
('beginner', 'Beginner', 'Start your running journey', 'Perfect for new runners. Learn proper technique and build endurance safely.', '8 weeks', '3 days/week', '$49/month', 'green', '["Walk-run intervals", "Basic running form", "Injury prevention", "Progress tracking"]'),
('5k-10k', '5K to 10K', 'Build your distance', 'Progress from 5K to 10K with structured training and speed work.', '10 weeks', '4 days/week', '$59/month', 'blue', '["Distance progression", "Speed intervals", "Race preparation", "Pacing strategies"]'),
('semi-marathon', 'Semi-Marathon', 'Half marathon training', 'Train for your first or improve your half marathon performance.', '12 weeks', '4-5 days/week', '$69/month', 'purple', '["Long run progression", "Tempo training", "Race nutrition", "Mental preparation"]'),
('marathon', 'Special Marathon', 'Full marathon mastery', 'Comprehensive marathon training for serious runners seeking excellence.', '16 weeks', '5-6 days/week', '$89/month', 'red', '["Periodized training", "Advanced nutrition", "Recovery protocols", "Race strategy"]'),
('trail-running', 'Trail Running', 'Off-road adventures', 'Master trail running techniques, terrain navigation, and outdoor endurance.', '12 weeks', '4 days/week', '$75/month', 'emerald', '["Terrain techniques", "Hill training", "Equipment guidance", "Safety protocols"]'),
('ultra-trail', 'Ultra Trail Running', 'Extreme endurance', 'Elite ultra-trail training for multi-hour mountain adventures and races.', '20 weeks', '5-6 days/week', '$129/month', 'indigo', '["Ultra endurance", "Mountain techniques", "Nutrition strategies", "Mental toughness"]');

-- Insert sample training videos
INSERT INTO training_videos (title, description, duration_seconds, thumbnail_url, category, is_premium) VALUES
('Proper Running Form Fundamentals', 'Learn the essential elements of efficient running form including posture, cadence, and foot strike patterns.', 754, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=225&fit=crop', 'technique', FALSE),
('5K Training Plan Workout', 'Follow along with this structured interval training session designed to improve your 5K race time.', 1518, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=225&fit=crop', 'training', FALSE),
('Pre-Run Nutrition Guide', 'Discover what to eat before your runs for optimal performance. Learn about timing and portion sizes.', 522, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=225&fit=crop', 'nutrition', FALSE),
('Post-Run Recovery Routine', 'Essential stretching and recovery techniques to prevent injury and improve performance.', 927, 'https://images.unsplash.com/photo-1506629905965-c319a2dbaa5e?w=400&h=225&fit=crop', 'recovery', FALSE),
('Hill Running Technique', 'Master the art of hill running with proper technique for both uphill and downhill sections.', 1135, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop', 'technique', TRUE),
('Marathon Training Mental Strategies', 'Develop mental toughness and strategies for long-distance running.', 1333, 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=225&fit=crop', 'training', TRUE);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_health_surveys_user_id ON health_surveys(user_id);
CREATE INDEX idx_user_program_enrollments_user_id ON user_program_enrollments(user_id);
CREATE INDEX idx_training_sessions_user_id ON training_sessions(user_id);
CREATE INDEX idx_training_sessions_date ON training_sessions(session_date);
CREATE INDEX idx_user_video_progress_user_id ON user_video_progress(user_id);
CREATE INDEX idx_dashboard_progress_user_id ON dashboard_progress(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Health Surveys: Users can only access their own health surveys
CREATE POLICY "Users can view own health surveys" ON health_surveys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own health surveys" ON health_surveys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own health surveys" ON health_surveys FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Program Enrollments: Users can only access their own enrollments
CREATE POLICY "Users can view own enrollments" ON user_program_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON user_program_enrollments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own enrollments" ON user_program_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Training Sessions: Users can only access their own sessions
CREATE POLICY "Users can view own sessions" ON training_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON training_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON training_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON training_sessions FOR DELETE USING (auth.uid() = user_id);

-- User Video Progress: Users can only access their own progress
CREATE POLICY "Users can view own video progress" ON user_video_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own video progress" ON user_video_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own video progress" ON user_video_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Dashboard Progress: Users can only access their own progress
CREATE POLICY "Users can view own dashboard progress" ON dashboard_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own dashboard progress" ON dashboard_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own dashboard progress" ON dashboard_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Training Programs and Videos are publicly readable
CREATE POLICY "Anyone can view training programs" ON training_programs FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Anyone can view training videos" ON training_videos FOR SELECT USING (is_active = TRUE);

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', new.email);
  
  INSERT INTO public.dashboard_progress (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER health_surveys_updated_at BEFORE UPDATE ON health_surveys FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER user_program_enrollments_updated_at BEFORE UPDATE ON user_program_enrollments FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER training_sessions_updated_at BEFORE UPDATE ON training_sessions FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER user_video_progress_updated_at BEFORE UPDATE ON user_video_progress FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER dashboard_progress_updated_at BEFORE UPDATE ON dashboard_progress FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Create function to update dashboard progress
CREATE OR REPLACE FUNCTION public.update_dashboard_progress()
RETURNS trigger AS $$
BEGIN
  -- Update dashboard progress when profile is completed
  IF TG_TABLE_NAME = 'profiles' AND NEW.profile_completed = TRUE THEN
    UPDATE dashboard_progress 
    SET profile_completed = TRUE, 
        overall_progress = calculate_overall_progress(NEW.id)
    WHERE user_id = NEW.id;
  END IF;
  
  -- Update dashboard progress when health survey is completed
  IF TG_TABLE_NAME = 'health_surveys' AND NEW.completed_at IS NOT NULL THEN
    UPDATE dashboard_progress 
    SET health_survey_completed = TRUE,
        overall_progress = calculate_overall_progress(NEW.user_id)
    WHERE user_id = NEW.user_id;
  END IF;
  
  -- Update dashboard progress when program is enrolled
  IF TG_TABLE_NAME = 'user_program_enrollments' AND NEW.is_active = TRUE THEN
    UPDATE dashboard_progress 
    SET program_selected = TRUE,
        overall_progress = calculate_overall_progress(NEW.user_id)
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate overall progress
CREATE OR REPLACE FUNCTION public.calculate_overall_progress(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  progress_count INTEGER := 0;
  total_steps INTEGER := 5;
BEGIN
  SELECT 
    (CASE WHEN profile_completed THEN 1 ELSE 0 END) +
    (CASE WHEN health_survey_completed THEN 1 ELSE 0 END) +
    (CASE WHEN program_selected THEN 1 ELSE 0 END) +
    (CASE WHEN calendar_setup THEN 1 ELSE 0 END) +
    (CASE WHEN videos_unlocked THEN 1 ELSE 0 END)
  INTO progress_count
  FROM dashboard_progress
  WHERE user_id = user_uuid;
  
  RETURN (progress_count * 100) / total_steps;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for dashboard progress updates
CREATE TRIGGER profile_progress_update AFTER UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE public.update_dashboard_progress();
CREATE TRIGGER health_survey_progress_update AFTER UPDATE ON health_surveys FOR EACH ROW EXECUTE PROCEDURE public.update_dashboard_progress();
CREATE TRIGGER enrollment_progress_update AFTER INSERT ON user_program_enrollments FOR EACH ROW EXECUTE PROCEDURE public.update_dashboard_progress();