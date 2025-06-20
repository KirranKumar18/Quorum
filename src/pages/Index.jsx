
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, Shield, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 animate-fade-in">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2 hover-scale">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center transition-all duration-300 hover:from-blue-700 hover:to-indigo-700">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent">Quorum</h1>
          </div>
          <div className="space-x-4">
            <Button variant="outline" className="hover-scale border-blue-300 text-blue-700 hover:bg-blue-50">Sign In</Button>
            <Button className="hover-scale bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">Sign Up</Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h2 className="text-5xl font-bold text-blue-900 mb-6 animate-scale-in">
            Connect Through Meaningful
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Group Conversations</span>
          </h2>
          <p className="text-xl text-blue-700 mb-8 leading-relaxed animate-fade-in" style={{animationDelay: '0.4s'}}>
            Quorum brings people together through focused group chats. Create communities, 
            share ideas, and build lasting connections in spaces designed for real conversation.
          </p>
          <div className="space-x-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <Button size="lg" className="px-8 py-3 text-lg hover-scale bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg hover-scale border-blue-300 text-blue-700 hover:bg-blue-50 transition-all duration-300">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-fade-in" style={{animationDelay: '0.8s'}}>
          <h3 className="text-3xl font-bold text-blue-900 mb-4">
            Why Choose Quorum?
          </h3>
          <p className="text-lg text-blue-700 max-w-2xl mx-auto">
            Built specifically for group conversations that matter
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in bg-gradient-to-br from-white to-blue-50 border-blue-200" style={{animationDelay: '1s'}}>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:from-blue-200 hover:to-indigo-200">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-blue-800">Smart Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-600">
                Create focused groups around topics, interests, or projects with intelligent organization tools.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in bg-gradient-to-br from-white to-indigo-50 border-indigo-200" style={{animationDelay: '1.2s'}}>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:from-indigo-200 hover:to-purple-200">
                <MessageCircle className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle className="text-xl text-indigo-800">Rich Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-indigo-600">
                Enhanced messaging with threads, reactions, and media sharing to keep discussions organized.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in bg-gradient-to-br from-white to-purple-50 border-purple-200" style={{animationDelay: '1.4s'}}>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:from-purple-200 hover:to-pink-200">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl text-purple-800">Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-purple-600">
                Your conversations stay private with end-to-end encryption and granular privacy controls.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 hover-scale animate-fade-in bg-gradient-to-br from-white to-cyan-50 border-cyan-200" style={{animationDelay: '1.6s'}}>
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 hover:from-cyan-200 hover:to-blue-200">
                <Zap className="w-6 h-6 text-cyan-600" />
              </div>
              <CardTitle className="text-xl text-cyan-800">Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-cyan-600">
                Real-time messaging with instant notifications to keep your conversations flowing seamlessly.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-16 animate-fade-in" style={{animationDelay: '1.8s'}}>
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4 animate-scale-in">
            Ready to Start Meaningful Conversations?
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of communities already using Quorum to connect, collaborate, and create together.
          </p>
          <div className="space-x-4">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg hover-scale transition-all duration-300">
              Sign Up Now
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg text-white border-white hover:bg-white hover:text-blue-600 hover-scale transition-all duration-300">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-8 animate-fade-in" style={{animationDelay: '2s'}}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4 hover-scale">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">Quorum</span>
          </div>
          <p className="text-blue-100">
            © 2024 Quorum. Building better conversations, one group at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
