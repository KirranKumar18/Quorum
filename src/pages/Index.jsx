
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, Shield, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 animate-fade-in">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2 hover-scale">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center transition-colors duration-300 hover:bg-emerald-700">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-900">Quorum</h1>
          </div>
          <div className="space-x-4">
            <Button variant="outline" className="hover-scale border-emerald-300 text-emerald-700 hover:bg-emerald-50">Sign In</Button>
            <Button className="hover-scale bg-emerald-600 hover:bg-emerald-700">Sign Up</Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h2 className="text-5xl font-bold text-gray-900 mb-6 animate-scale-in">
            Connect Through Meaningful
            <span className="text-emerald-600"> Group Conversations</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in" style={{animationDelay: '0.4s'}}>
            Quorum brings people together through focused group chats. Create communities, 
            share ideas, and build lasting connections in spaces designed for real conversation.
          </p>
          <div className="space-x-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <Button size="lg" className="px-8 py-3 text-lg hover-scale bg-emerald-600 hover:bg-emerald-700 transition-all duration-300">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg hover-scale border-emerald-300 text-emerald-700 hover:bg-emerald-50 transition-all duration-300">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-fade-in" style={{animationDelay: '0.8s'}}>
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Quorum?
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built specifically for group conversations that matter
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in" style={{animationDelay: '1s'}}>
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 hover:bg-emerald-200">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-xl">Smart Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create focused groups around topics, interests, or projects with intelligent organization tools.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in" style={{animationDelay: '1.2s'}}>
            <CardHeader>
              <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 hover:bg-teal-200">
                <MessageCircle className="w-6 h-6 text-teal-600" />
              </div>
              <CardTitle className="text-xl">Rich Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Enhanced messaging with threads, reactions, and media sharing to keep discussions organized.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in" style={{animationDelay: '1.4s'}}>
            <CardHeader>
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 hover:bg-cyan-200">
                <Shield className="w-6 h-6 text-cyan-600" />
              </div>
              <CardTitle className="text-xl">Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your conversations stay private with end-to-end encryption and granular privacy controls.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in" style={{animationDelay: '1.6s'}}>
            <CardHeader>
              <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-300 hover:bg-lime-200">
                <Zap className="w-6 h-6 text-lime-600" />
              </div>
              <CardTitle className="text-xl">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time messaging with instant notifications to keep your conversations flowing seamlessly.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-emerald-600 py-16 animate-fade-in" style={{animationDelay: '1.8s'}}>
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4 animate-scale-in">
            Ready to Start Meaningful Conversations?
          </h3>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of communities already using Quorum to connect, collaborate, and create together.
          </p>
          <div className="space-x-4">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg hover-scale transition-all duration-300">
              Sign Up Now
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg text-white border-white hover:bg-white hover:text-emerald-600 hover-scale transition-all duration-300">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 animate-fade-in" style={{animationDelay: '2s'}}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4 hover-scale">
            <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">Quorum</span>
          </div>
          <p className="text-gray-400">
            © 2024 Quorum. Building better conversations, one group at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
