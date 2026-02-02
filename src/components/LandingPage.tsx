import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronDown, Code, Heart, Sparkles } from 'lucide-react';

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

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

  // Initialize particles
  useEffect(() => {
    const particles: Particle[] = [];
    const numParticles = 80;
    
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

  // Update mouse position ref
  useEffect(() => {
    mouseRef.current = {
      x: (mousePosition.x / 20 + 0.5) * window.innerWidth,
      y: (mousePosition.y / 20 + 0.5) * window.innerHeight
    };
  }, [mousePosition]);

  // Animation loop
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

      // Draw connections between nearby particles
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

      // Update and draw particles
      particles.forEach((particle) => {
        // Mouse interaction - particles move away from cursor
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

        // Return to base position slowly
        particle.x += (particle.baseX - particle.x) * 0.02;
        particle.y += (particle.baseY - particle.y) * 0.02;

        // Gentle floating motion
        particle.x += Math.sin(Date.now() * 0.001 * particle.speed + particle.id) * 0.3;
        particle.y += Math.cos(Date.now() * 0.001 * particle.speed + particle.id) * 0.3;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
        ctx.globalAlpha = 1;
        ctx.fill();

        // Draw glow for larger particles
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

      // Draw mouse glow
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

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Scroll animation refs
  const aboutSection = useScrollAnimation();
  const creatorSection = useScrollAnimation();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Mouse parallax effect
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

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden">
      {/* Interactive particle background */}
      <InteractiveBackground mousePosition={mousePosition} />
      
      {/* Gradient overlays */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-transparent to-[#0a0a0b] opacity-60" />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#0a0a0b] to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0b] to-transparent" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`} style={{ zIndex: 50 }}>
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="text-2xl font-semibold tracking-tight">
            Quorum
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="text-white/70 hover:text-white hover:bg-white/5 text-sm"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button 
              className="bg-white text-black hover:bg-white/90 text-sm px-5 rounded-full"
              onClick={() => navigate('/signup')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto text-center">
          {/* Animated badge */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8 transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/60">Now in public beta</span>
          </div>

          {/* Main heading */}
          <h1 
            className={`text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6 transition-all duration-1000 delay-200 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <span className="block">Where groups</span>
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              come alive
            </span>
          </h1>

          {/* Subtitle */}
          <p 
            className={`text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed transition-all duration-1000 delay-400 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            A minimalist space for meaningful group conversations. 
            No noise, no distractions — just your community.
          </p>

          {/* CTA Buttons */}
          <div 
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-600 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Button 
              size="lg"
              className="bg-white text-black hover:bg-white/90 text-base px-8 py-6 rounded-full group"
              onClick={() => navigate('/signup')}
            >
              Start for free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg"
              variant="outline" 
              className="border-white/20 text-black hover:bg-white/5 text-base px-8 py-6 rounded-full"
              onClick={() => navigate('/guest-chat')}
            >
              Try as guest
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <button 
          onClick={scrollToAbout}
          className={`absolute bottom-12 left-1/2 -translate-x-1/2 text-white/30 hover:text-white/60 transition-all duration-1000 delay-1000 cursor-pointer ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </button>
      </section>

      {/* About Quorum Section */}
      <section id="about" className="py-32 px-6 relative" ref={aboutSection.ref} style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto">
          <div 
            className={`transition-all duration-1000 ${
              aboutSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Section badge */}
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span className="text-indigo-400 text-sm font-medium tracking-wider uppercase">About Quorum</span>
            </div>
            
            {/* Main content */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              A space built for
              <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                real connections
              </span>
            </h2>
            
            <div className="space-y-6 text-lg sm:text-xl text-white/60 leading-relaxed">
              <p>
                Quorum is a modern, real-time group chat platform designed with one philosophy in mind: 
                <span className="text-white"> communities over individuals</span>. No DMs, no private messages — 
                just pure, meaningful group conversations.
              </p>
              
              <p>
                Built with <span className="text-indigo-400">React</span>, <span className="text-purple-400">Socket.io</span>, 
                and <span className="text-pink-400">Supabase</span>, Quorum delivers instant message delivery 
                with a buttery-smooth experience. Every message arrives the moment it's sent, 
                creating conversations that feel alive.
              </p>
              
              <p>
                The dark, minimalist interface isn't just aesthetic — it's intentional. 
                Less visual noise means more focus on what matters: your community's conversations.
              </p>
            </div>

            {/* Tech stack pills */}
            <div 
              className={`flex flex-wrap gap-3 mt-12 transition-all duration-1000 delay-300 ${
                aboutSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {['React', 'TypeScript', 'Socket.io', 'Supabase', 'MongoDB', 'Tailwind CSS'].map((tech) => (
                <span 
                  key={tech}
                  className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/60 text-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About KK Section */}
      <section className="py-32 px-6 relative" ref={creatorSection.ref} style={{ zIndex: 10 }}>
        <div className="max-w-4xl mx-auto">
          <div 
            className={`transition-all duration-1000 ${
              creatorSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            {/* Section badge */}
            <div className="flex items-center gap-2 mb-8">
              <Code className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 text-sm font-medium tracking-wider uppercase">The Creator</span>
            </div>
            
            {/* Main content */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              Made by KK,
              <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                for KK
              </span>
            </h2>
            
            <div className="space-y-6 text-lg sm:text-xl text-white/60 leading-relaxed">
              <p>
                Hey, I'm <span className="text-white font-semibold">KK</span> — a developer who believes 
                the best way to learn is to build something real. Quorum isn't just a project; 
                it's a passion piece.
              </p>
              
              <p>
                I'm the kind of person who notices when real-time messaging isn't actually real-time, 
                and won't rest until it's fixed. <span className="text-purple-400">Detail-oriented</span> to a fault, 
                I obsess over the little things — smooth animations, clean code, and interfaces 
                that just <span className="italic">feel</span> right.
              </p>
              
              <p>
                When I'm not debugging socket connections at midnight, you'll find me 
                exploring new technologies, refining UI details pixel by pixel, and 
                turning ideas into interactive experiences. I built Quorum because I wanted 
                a chat platform that matched my standards — <span className="text-pink-400">minimal, fast, and beautiful</span>.
              </p>
              
              <p className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                <span className="text-white/40">Built with late nights and lots of coffee</span>
              </p>
            </div>

            {/* Traits */}
            <div 
              className={`grid sm:grid-cols-3 gap-4 mt-12 transition-all duration-1000 delay-300 ${
                creatorSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {[
                { label: 'Detail-Oriented', desc: 'Every pixel matters' },
                { label: 'Problem Solver', desc: 'Bugs don\'t stand a chance' },
                { label: 'Always Learning', desc: 'Growth never stops' }
              ].map((trait) => (
                <div 
                  key={trait.label}
                  className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]"
                >
                  <div className="text-white font-semibold mb-1">{trait.label}</div>
                  <div className="text-white/40 text-sm">{trait.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 relative" style={{ zIndex: 10 }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to join?
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-xl mx-auto">
            Experience what group chat should feel like.
          </p>
          <Button 
            size="lg"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-base px-10 py-6 rounded-full group shadow-lg shadow-indigo-500/25"
            onClick={() => navigate('/signup')}
          >
            Get Started
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 relative" style={{ zIndex: 10 }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-white/30 text-sm">
            © 2026 Quorum. All rights reserved.
          </div>
          <div className="flex gap-6 text-white/30 text-sm">
            <button className="hover:text-white/60 transition-colors">Privacy</button>
            <button className="hover:text-white/60 transition-colors">Terms</button>
            <button className="hover:text-white/60 transition-colors">Contact</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;