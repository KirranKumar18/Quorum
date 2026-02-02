import { useState, useEffect, useRef } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
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

const SignupPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
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

  const steps = [
    { id: 1, title: 'Choose your username', field: 'username', placeholder: 'Enter username', type: 'text' },
    { id: 2, title: 'What\'s your email?', field: 'email', placeholder: 'Enter email address', type: 'email' },
    { id: 3, title: 'Create a password', field: 'password', placeholder: 'Enter password', type: 'password' },
  ];

  const currentStepData = steps.find(step => step.id === currentStep);

  const handleNext = async () => {
    const currentValue = formData[currentStepData?.field as keyof typeof formData];
    if (!currentValue) return;

    if (currentStep < 3) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsTransitioning(false);
      }, 200);
    } else {
      // Handle signup completion with Supabase
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
            }
          }
        });

        if (error) {
          toast({
            title: "Signup Failed",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data.user) {
          toast({
            title: "Success",
            description: "Account created successfully! Please check your email for verification.",
          });
          navigate('/login');
        }
      } catch (error) {
        console.error('Signup error:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsTransitioning(false);
      }, 200);
    }
  };

  const handleInputChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      [currentStepData?.field as keyof typeof formData]: value
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNext();
    }
  };

  const isCurrentStepValid = () => {
    const currentValue = formData[currentStepData?.field as keyof typeof formData];
    return currentValue && currentValue.length > 0;
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

          {/* Progress Indicator */}
          <div className={`flex justify-center mb-8 transition-all duration-700 delay-100 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex space-x-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    step.id <= currentStep
                      ? 'bg-gradient-to-r from-indigo-400 to-purple-400 shadow-lg shadow-indigo-500/50'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Form Card */}
          <div className={`bg-white/[0.03] backdrop-blur-sm rounded-2xl p-8 border border-white/10 transition-all duration-700 delay-200 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
              {/* Step Indicator */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-4">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span className="text-xs text-white/50">Step {currentStep} of 3</span>
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {currentStepData?.title}
                </h2>
              </div>

              {/* Input Field */}
              <div className="space-y-6">
                <Input
                  type={currentStepData?.type}
                  placeholder={currentStepData?.placeholder}
                  value={formData[currentStepData?.field as keyof typeof formData]}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 text-lg p-4 h-14 focus:border-indigo-500/50 focus:ring-indigo-500/20 transition-all"
                  autoFocus
                />

                {/* Navigation Buttons */}
                <div className="flex justify-between space-x-4">
                  <Button
                    variant="outline"
                    className={`text-black border-white/10 hover:bg-white/5 hover:text-white ${
                      currentStep === 1 ? 'invisible' : ''
                    }`}
                    onClick={handleBack}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  <Button
                    className={`bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white flex-1 shadow-lg shadow-indigo-500/25 ${
                      (!isCurrentStepValid() || loading) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleNext}
                    disabled={!isCurrentStepValid() || loading}
                  >
                    {currentStep === 3 ? (
                      <>
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        {loading ? 'Creating...' : 'Complete'}
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <div className={`text-center mt-6 transition-all duration-700 delay-300 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <span className="text-white/40">Already have an account? </span>
            <button
              onClick={() => navigate('/login')}
              className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors"
            >
              Sign in
            </button>
          </div>

          {/* Guest Chat Option */}
          <div className={`mt-8 p-6 rounded-2xl border border-white/5 bg-white/[0.02] transition-all duration-700 delay-400 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <h3 className="text-white font-medium mb-2">Try without signing up</h3>
            <p className="text-white/40 text-sm mb-4">
              Experience Quorum as a guest. No account needed.
            </p>
            <Button
              variant="outline"
              className="w-full text-black border-white/10 hover:bg-white/5 hover:text-white"
              onClick={() => navigate('/guest-chat')}
            >
              Enter Guest Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;