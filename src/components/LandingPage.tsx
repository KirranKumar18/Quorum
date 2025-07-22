import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Zap } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Group Focus",
      description: "Connect with communities, not individuals"
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Instant messaging with smooth animations"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built for speed and beautiful interactions"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-white">
            GroupFlow
          </div>
          <div className="space-x-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/10 border border-white/20"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button 
              className="bg-white text-primary hover:bg-white/90 shadow-glow"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className={`space-y-8 ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
              Connect in 
              <span className="bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
                {" "}Groups
              </span>
            </h1>
            
            <p className="text-xl text-white/90 leading-relaxed max-w-lg">
              Join vibrant communities and engage in meaningful conversations. 
              No more one-on-one noise—just pure group energy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-glow text-lg px-8 py-4"
                onClick={() => navigate('/signup')}
              >
                Start Chatting
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="text-white border-white/30 hover:bg-white/10 text-lg px-8 py-4"
              >
                Learn More
              </Button>
            </div>
          </div>

          <div className={`relative ${isLoaded ? 'animate-scale-in' : 'opacity-0'}`}>
            <img 
              src={heroImage} 
              alt="Group chat visualization" 
              className="w-full h-auto rounded-2xl shadow-elegant animate-float"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 ${
                isLoaded ? 'animate-slide-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <feature.icon className="w-8 h-8 text-white mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-white/80">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-white/5 animate-float"></div>
        <div className="absolute top-60 -left-20 w-60 h-60 rounded-full bg-white/10" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-primary-glow/20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default LandingPage;