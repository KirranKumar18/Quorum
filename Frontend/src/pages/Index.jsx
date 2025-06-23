import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 animate-fade-in">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2 hover-scale">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center transition-all duration-300 hover:from-blue-600 hover:to-indigo-600">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Quorum</h1>
          </div>
          <div className="space-x-4">
            <Button variant="outline" className="hover-scale border-blue-400 text-blue-300 hover:bg-blue-950" onClick={()=>{navigate('./login')}}>Sign In</Button>
            <Button className="hover-scale bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h2 className="text-5xl font-bold text-white mb-6 animate-scale-in">
            Connect Through Meaningful
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> Group Conversations</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed animate-fade-in" style={{animationDelay: '0.4s'}}>
            Quorum brings people together through focused group chats. Create communities, 
            share ideas, and build lasting connections in spaces designed for real conversation.
          </p>
          <div className="space-x-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <Button size="lg" className="px-8 py-3 text-lg hover-scale bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg hover-scale border-blue-400 text-blue-300 hover:bg-blue-950 transition-all duration-300">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-fade-in" style={{animationDelay: '0.8s'}}>
          <h3 className="text-3xl font-bold text-white mb-4">
            Why Choose Quorum?
          </h3>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Built specifically for group conversations that matter
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" style={{animationDelay: '1s'}}>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:from-blue-700 hover:to-indigo-700">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-blue-300">Smart Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Create focused groups around topics, interests, or projects with intelligent organization tools.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" style={{animationDelay: '1.2s'}}>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:from-indigo-700 hover:to-purple-700">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-indigo-300">Rich Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Enhanced messaging with threads, reactions, and media sharing to keep discussions organized.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" style={{animationDelay: '1.4s'}}>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:from-purple-700 hover:to-pink-700">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-purple-300">Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Your conversations stay private with end-to-end encryption and granular privacy controls.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700" style={{animationDelay: '1.6s'}}>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:from-cyan-700 hover:to-blue-700">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl text-cyan-300">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-400">
                Real-time messaging with instant notifications to keep your conversations flowing seamlessly.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-800 via-indigo-800 to-purple-800 py-16 animate-fade-in" style={{animationDelay: '1.8s'}}>
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4 animate-scale-in">
            Ready to Start Meaningful Conversations?
          </h3>
          <p className="text-xl text-blue-200 mb-8 max-w-2xl mx-auto">
            Join thousands of communities already using Quorum to connect, collaborate, and create together.
          </p>
          <div className="space-x-4">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg hover-scale transition-all duration-300 bg-white text-gray-900 hover:bg-gray-100">
              Sign Up Now
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg text-white border-white hover:bg-white hover:text-blue-800 hover-scale transition-all duration-300">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-950 to-slate-950 text-white py-8 animate-fade-in" style={{animationDelay: '2s'}}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4 hover-scale">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
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
