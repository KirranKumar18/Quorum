
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageCircle, Shield, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-indigo-900">Quorum</h1>
          </div>
          <div className="space-x-4">
            <Button variant="outline">Sign In</Button>
            <Button>Sign Up</Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Connect Through Meaningful
            <span className="text-indigo-600"> Group Conversations</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Quorum brings people together through focused group chats. Create communities, 
            share ideas, and build lasting connections in spaces designed for real conversation.
          </p>
          <div className="space-x-4">
            <Button size="lg" className="px-8 py-3 text-lg">
              Get Started Free
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Quorum?
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built specifically for group conversations that matter
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <CardTitle className="text-xl">Smart Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create focused groups around topics, interests, or projects with intelligent organization tools.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-xl">Rich Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Enhanced messaging with threads, reactions, and media sharing to keep discussions organized.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Privacy First</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your conversations stay private with end-to-end encryption and granular privacy controls.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
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
      <section className="bg-indigo-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Start Meaningful Conversations?
          </h3>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of communities already using Quorum to connect, collaborate, and create together.
          </p>
          <div className="space-x-4">
            <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
              Sign Up Now
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg text-white border-white hover:bg-white hover:text-indigo-600">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
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
