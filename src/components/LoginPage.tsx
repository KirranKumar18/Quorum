import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, LogIn } from 'lucide-react'; 
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/dashboard');
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return formData.email && formData.password;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Iridescence Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-accent/20 to-primary/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-primary/15 to-accent/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Back to Landing */}
          <Button
            variant="ghost"
            className="text-foreground hover:bg-primary/10 border border-primary/20 backdrop-blur-sm mb-8"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Login Form */}
          <div className="bg-background/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-elegant animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-elegant bg-clip-text text-transparent mb-2">
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Sign in to continue to GroupSpark
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-background/50 border-white/20 backdrop-blur-sm text-lg p-4 h-14"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="bg-background/50 border-white/20 backdrop-blur-sm text-lg p-4 h-14"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className={`w-full bg-gradient-primary text-white hover:shadow-glow text-lg py-4 transition-all duration-300 ${
                  (!isFormValid() || loading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!isFormValid() || loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Users */}
            <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-muted-foreground mb-2 text-center">Demo Credentials:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Email: demo@groupspark.com</p>
                <p>Password: demo123</p>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-center mt-6">
              <button className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Forgot your password?
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <span className="text-muted-foreground">Don't have an account? </span>
            <button
              onClick={() => navigate('/signup')}
              className="text-primary font-semibold hover:underline transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;