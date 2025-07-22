import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, LogIn } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.email && formData.password) {
      // Mock login - in real app, this would validate credentials
      localStorage.setItem('user', JSON.stringify({
        username: formData.email.split('@')[0],
        email: formData.email,
        isLoggedIn: true
      }));
      navigate('/dashboard');
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
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back to Landing */}
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 mb-8"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-elegant animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back
            </h1>
            <p className="text-white/70">
              Sign in to continue to GroupFlow
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 text-lg p-4 h-14"
                required
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/60 text-lg p-4 h-14"
                required
              />
            </div>

            <Button
              type="submit"
              className={`w-full bg-white text-primary hover:bg-white/90 shadow-glow text-lg py-4 ${
                !isFormValid() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!isFormValid()}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </form>

          {/* Forgot Password */}
          <div className="text-center mt-6">
            <button className="text-white/70 hover:text-white text-sm">
              Forgot your password?
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <span className="text-white/60">Don't have an account? </span>
          <button
            onClick={() => navigate('/signup')}
            className="text-white font-semibold hover:underline"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;