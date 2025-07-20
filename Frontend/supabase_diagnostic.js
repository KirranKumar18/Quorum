// Diagnostic script to test Supabase connection and settings
// Add this temporarily to your signup form to debug

const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if we can connect to Supabase
    const { data: testData, error: testError } = await supabase
      .from('_test_table_that_doesnt_exist')
      .select('*')
      .limit(1);
    
    console.log('Connection test (expected error):', testError?.message);
    
    // Test 2: Check auth settings
    const { data: session } = await supabase.auth.getSession();
    console.log('Current session:', session);
    
    // Test 3: Try a simple signup with a test email
    const testEmail = 'test@example.com';
    const testPassword = 'testpass123';
    
    const { data: signupTest, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          username: 'testuser'
        }
      }
    });
    
    console.log('Signup test result:', { signupTest, signupError });
    
  } catch (error) {
    console.error('Diagnostic error:', error);
  }
};

// Call this function in your component or console to debug
// testSupabaseConnection();
