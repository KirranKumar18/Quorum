import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Zap, Sparkles, Shield, Crown } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Group-Only Focus",
      description: "Connect with communities, not individuals. Pure group energy.",
      gradient: "from-primary to-accent"
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Instant messaging with buttery smooth animations and effects.",
      gradient: "from-accent to-primary"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Built for speed with beautiful interactions and dark aesthetics.",
      gradient: "from-primary to-accent"
    }
  ];

  // Split text animation component
  const SplitText = ({ children, className = "", delay = 0 }: { children: string; className?: string; delay?: number }) => {
    const letters = children.split('');
    
    return (
      <span className={className}>
        {letters.map((letter, index) => (
          <span
            key={index}
            className={`inline-block transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ 
              transitionDelay: `${delay + index * 50}ms`,
              animationDelay: `${delay + index * 50}ms`
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        ))}
      </span>
    );
  };

  // Text pressure effect component
  const TextPressure = ({ children, className = "" }: { children: string; className?: string }) => {
    return (
      <span 
        className={`${className} transition-all duration-500 hover:scale-105 hover:tracking-wider cursor-default`}
      >
        {children}
      </span>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Iridescence Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5">
        {/* Main iridescent gradients */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-30"
            style={{
              background: `
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 60% 60%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
              `
            }}
          />
        </div>
        
        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-20 left-20 w-64 h-64 opacity-20 animate-float"
            style={{
              background: 'radial-gradient(circle, rgba(120, 119, 198, 0.4) 0%, rgba(120, 119, 198, 0.1) 50%, transparent 100%)',
              filter: 'blur(40px)',
            }}
          />
          <div 
            className="absolute top-60 right-32 w-48 h-48 opacity-25 animate-float"
            style={{
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
              filter: 'blur(30px)',
              animationDelay: '2s'
            }}
          />
          <div 
            className="absolute bottom-32 left-1/3 w-80 h-80 opacity-15 animate-float"
            style={{
              background: 'radial-gradient(circle, rgba(120, 119, 198, 0.3) 0%, rgba(120, 119, 198, 0.1) 50%, transparent 100%)',
              filter: 'blur(50px)',
              animationDelay: '4s'
            }}
          />
        </div>

        {/* Mesh gradient overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(45deg, transparent 25%, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.1) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.1) 75%),
              linear-gradient(-45deg, transparent 25%, rgba(120,119,198,0.1) 25%, rgba(120,119,198,0.1) 50%, transparent 50%, transparent 75%, rgba(120,119,198,0.1) 75%)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className={`p-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-5xl font-bold bg-gradient-elegant bg-clip-text text-transparent">
              Quorum
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                className="text-foreground hover:bg-primary/10 border border-primary/20 backdrop-blur-sm"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button 
                className="bg-gradient-primary text-white hover:shadow-glow transition-all duration-300"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
              <Button 
                variant="outline"
                className="border-accent/30 text-accent hover:bg-accent/10 backdrop-blur-sm"
                onClick={() => navigate('/guest-chat')}
              >
                Guest Chat
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="text-center space-y-8">
            {/* Main Heading with SplitText Animation */}
            <div className="space-y-4">
              <h1 className="text-6xl lg:text-8xl font-bold leading-tight">
                <SplitText className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                  Quorum
                </SplitText>
              </h1>
              
              <div className="text-2xl lg:text-4xl font-semibold">
                <TextPressure className="text-foreground/80">
                  Where Communities Come Alive
                </TextPressure>
              </div>
            </div>
            
            {/* Subtitle with fade-in */}
            <p className={`text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-4xl mx-auto transition-all duration-1000 delay-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Join vibrant communities and engage in meaningful conversations. 
              Experience the power of group-focused chatting with stunning dark aesthetics and smooth animations.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-6 justify-center pt-8 transition-all duration-1000 delay-1500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <Button 
                size="lg"
                className="bg-gradient-primary text-white hover:shadow-glow text-lg px-12 py-6 rounded-xl transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/signup')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Your Journey
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="border-primary/30 text-foreground hover:bg-primary/10 text-lg px-12 py-6 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/guest-chat')}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Try Guest Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className={`text-center mb-16 transition-all duration-1000 delay-2000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">
              <TextPressure className="bg-gradient-elegant bg-clip-text text-transparent">
                Why Choose Quorum?
              </TextPressure>
            </h2>
            <p className="text-xl text-muted-foreground">
              Experience the future of group communication
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className={`group relative bg-background/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-elegant hover:shadow-glow transition-all duration-700 hover:scale-105 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${2500 + index * 200}ms` }}
              >
                {/* Feature icon with gradient background */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect gradient border */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`} />
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="max-w-4xl mx-auto px-6 pb-32 text-center">
          <div className={`bg-background/30 backdrop-blur-lg rounded-3xl p-12 border border-white/10 shadow-elegant transition-all duration-1000 delay-3500 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <Crown className="w-16 h-16 text-accent mx-auto mb-6" />
            <h3 className="text-3xl lg:text-4xl font-bold mb-6">
              <TextPressure className="bg-gradient-elegant bg-clip-text text-transparent">
                Ready to Spark Connections?
              </TextPressure>
            </h3>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join thousands of users already experiencing the magic of group-focused communication.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-primary text-white hover:shadow-glow text-lg px-10 py-4 rounded-xl transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/signup')}
              >
                <Shield className="w-5 h-5 mr-2" />
                Create Account
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                className="border-primary/30 text-foreground hover:bg-primary/10 text-lg px-10 py-4 rounded-xl backdrop-blur-sm transition-all duration-300"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;