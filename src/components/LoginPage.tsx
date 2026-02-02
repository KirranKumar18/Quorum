import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, LogIn, Sparkles } from 'lucide-react'; 
import { toast } from "@/hooks/use-toast";

// Interactive particle type
interface Particle {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
  speed: number;
}

// Interactive Background Component
const InteractiveBackground = ({ mousePosition }: { mousePosition: { x: number; y: number } }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const particles: Particle[] = [];
    const numParticles = 50;
    
    for (let i = 0; i < numParticles; i++) {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      particles.push({
        id: i,
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        speed: Math.random() * 0.5 + 0.2
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    mouseRef.current = {
      x: (mousePosition.x / 20 + 0.5) * window.innerWidth,
      y: (mousePosition.y / 20 + 0.5) * window.innerHeight
    };
  }, [mousePosition]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.globalAlpha = (1 - distance / 150) * 0.3;
            ctx.stroke();
          }
        }
      }

      particles.forEach((particle) => {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          particle.x -= Math.cos(angle) * force * 3;
          particle.y -= Math.sin(angle) * force * 3;
        }

        particle.x += (particle.baseX - particle.x) * 0.02;
        particle.y += (particle.baseY - particle.y) * 0.02;
        particle.x += Math.sin(Date.now() * 0.001 * particle.speed + particle.id) * 0.3;
        particle.y += Math.cos(Date.now() * 0.001 * particle.speed + particle.id) * 0.3;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
        ctx.globalAlpha = 1;
        ctx.fill();

        if (particle.size > 1.5) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 3
          );
          gradient.addColorStop(0, `rgba(99, 102, 241, ${particle.opacity * 0.3})`);
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      const glowGradient = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 200
      );
      glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
      glowGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.05)');
      glowGradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-hidden">
      {/* Interactive particle background */}
      <InteractiveBackground mousePosition={mousePosition} />
      
      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-transparent to-[#0a0a0b] opacity-60" />
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-6" style={{ zIndex: 10 }}>
        <div className="w-full max-w-md">
          {/* Back to Landing */}
          <Button
            variant="ghost"
            className={`text-white/70 hover:text-white hover:bg-white/5 mb-8 transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          {/* Login Form */}
          <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl p-8 border border-white/10 transition-all duration-700 delay-100 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-4">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span className="text-xs text-white/50">Welcome back</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Sign in to Quorum
              </h1>
              <p className="text-white/40">
                Continue your conversations
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-lg p-4 h-14 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-lg p-4 h-14 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className={`w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-lg py-6 shadow-lg shadow-indigo-500/25 transition-all duration-300 ${
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
            <div className="mt-6 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
              <p className="text-sm text-white/40 mb-2 text-center">Demo Credentials</p>
              <div className="text-xs text-white/30 space-y-1 text-center">
                <p>Email: demo@quorum.com</p>
                <p>Password: demo123</p>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-center mt-6">
              <button className="text-white/40 hover:text-white/60 text-sm transition-colors">
                Forgot your password?
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className={`text-center mt-6 transition-all duration-700 delay-200 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <span className="text-white/40">Don't have an account? </span>
            <button
              onClick={() => navigate('/signup')}
              className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
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