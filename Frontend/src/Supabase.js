
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yplcuvdaunxggoolmsvp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwbGN1dmRhdW54Z2dvb2xtc3ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4MzYzMzIsImV4cCI6MjA0NzQxMjMzMn0.9gAVNY1Q-2R5464ARrOWKNk_AplFhrxSypLuAX3hlLM';

export const supabase = createClient(supabaseUrl, supabaseKey);
