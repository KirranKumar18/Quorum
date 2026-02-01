-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  about_me TEXT DEFAULT '',
  profile_photo_url TEXT,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group types enum
CREATE TYPE public.group_type AS ENUM ('custom', 'class');

-- Create groups table
CREATE TABLE public.groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  group_type group_type NOT NULL DEFAULT 'custom',
  max_members INTEGER DEFAULT 50,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group memberships table
CREATE TABLE public.group_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- Create user activities table for streak tracking
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type TEXT DEFAULT 'login',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, activity_date, activity_type)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for groups
CREATE POLICY "Users can view all groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Users can create groups" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Group creators can update their groups" ON public.groups FOR UPDATE USING (auth.uid() = created_by);

-- Create RLS policies for group memberships
CREATE POLICY "Users can view all memberships" ON public.group_memberships FOR SELECT USING (true);
CREATE POLICY "Users can join groups" ON public.group_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave groups" ON public.group_memberships FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user activities
CREATE POLICY "Users can view their own activities" ON public.user_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activities" ON public.user_activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update streak
CREATE OR REPLACE FUNCTION public.update_user_streak(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  last_activity DATE;
  current_streak_val INTEGER;
  longest_streak_val INTEGER;
BEGIN
  -- Get current streak values
  SELECT current_streak, longest_streak, last_activity_date
  INTO current_streak_val, longest_streak_val, last_activity
  FROM public.profiles
  WHERE user_id = user_uuid;

  -- Check if user was active yesterday or today
  IF last_activity = CURRENT_DATE THEN
    -- Already logged in today, do nothing
    RETURN;
  ELSIF last_activity = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    current_streak_val := current_streak_val + 1;
  ELSE
    -- Streak broken, reset to 1
    current_streak_val := 1;
  END IF;

  -- Update longest streak if current is higher
  IF current_streak_val > longest_streak_val THEN
    longest_streak_val := current_streak_val;
  END IF;

  -- Update profile
  UPDATE public.profiles
  SET 
    current_streak = current_streak_val,
    longest_streak = longest_streak_val,
    last_activity_date = CURRENT_DATE
  WHERE user_id = user_uuid;

  -- Insert activity record
  INSERT INTO public.user_activities (user_id, activity_date, activity_type)
  VALUES (user_uuid, CURRENT_DATE, 'login')
  ON CONFLICT (user_id, activity_date, activity_type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check group join limits
CREATE OR REPLACE FUNCTION public.can_join_group(user_uuid UUID, group_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  custom_group_count INTEGER;
  class_group_count INTEGER;
  target_group_type group_type;
BEGIN
  -- Get the group type
  SELECT group_type INTO target_group_type
  FROM public.groups
  WHERE id = group_uuid;

  -- Count current memberships
  SELECT 
    COUNT(CASE WHEN g.group_type = 'custom' THEN 1 END),
    COUNT(CASE WHEN g.group_type = 'class' THEN 1 END)
  INTO custom_group_count, class_group_count
  FROM public.group_memberships gm
  JOIN public.groups g ON gm.group_id = g.id
  WHERE gm.user_id = user_uuid;

  -- Check limits
  IF target_group_type = 'custom' AND custom_group_count >= 2 THEN
    RETURN FALSE;
  ELSIF target_group_type = 'class' AND class_group_count >= 1 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;