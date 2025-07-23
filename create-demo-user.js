import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://mzpzuyklwgmsjzofayxf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cHp1eWtsd2dtc2p6b2ZheXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxODA5MzEsImV4cCI6MjA2ODc1NjkzMX0.rmYA7Yk9w-Sl2qij8e9dVSKGBMNTBxlWTgV8SFC9TkM";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function createDemoUser() {
  try {
    console.log('Creating demo user...');
    
    const { data, error } = await supabase.auth.signUp({
      email: 'demo@groupspark.com',
      password: 'demo123',
      options: {
        data: {
          username: 'demo_user',
        }
      }
    });

    if (error) {
      console.error('Error creating demo user:', error.message);
      return;
    }

    console.log('Demo user created successfully:', data);
    console.log('Email: demo@groupspark.com');
    console.log('Password: demo123');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createDemoUser();
