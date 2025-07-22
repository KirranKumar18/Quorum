import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, Users, LogOut, Plus } from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  // Mock groups data
  const groups = [
    {
      id: 1,
      name: "Frontend Developers",
      description: "Discussing React, Vue, and modern web development",
      members: 1247,
      lastMessage: "What are your thoughts on the new React 19 features?",
      lastActivity: "2 minutes ago",
      unreadCount: 3
    },
    {
      id: 2,
      name: "Design Systems",
      description: "Building consistent and scalable design languages",
      members: 892,
      lastMessage: "Just shared our new component library!",
      lastActivity: "1 hour ago",
      unreadCount: 0
    },
    {
      id: 3,
      name: "Tech News",
      description: "Latest updates from the tech world",
      members: 2156,
      lastMessage: "Apple's new AI features are impressive",
      lastActivity: "3 hours ago",
      unreadCount: 12
    },
    {
      id: 4,
      name: "Startup Founders",
      description: "Connecting entrepreneurs and sharing experiences",
      members: 634,
      lastMessage: "Looking for a technical co-founder",
      lastActivity: "5 hours ago",
      unreadCount: 1
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const enterChat = (groupId: number) => {
    navigate(`/chat/${groupId}`);
  };

  if (!user) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-foreground">GroupFlow</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.username}! 👋
          </h2>
          <p className="text-muted-foreground text-lg">
            Ready to dive into your group conversations?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-card animate-slide-up">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{groups.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unread Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {groups.reduce((total, group) => total + group.unreadCount, 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-white/30 shadow-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {groups.reduce((total, group) => total + group.members, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups Section */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-foreground">Your Groups</h3>
          <Button className="bg-primary hover:bg-primary/90 shadow-glow">
            <Plus className="w-4 h-4 mr-2" />
            Join New Group
          </Button>
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {groups.map((group, index) => (
            <Card 
              key={group.id} 
              className="bg-white/60 backdrop-blur-sm border-white/30 shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => enterChat(group.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {group.name}
                      {group.unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary rounded-full">
                          {group.unreadCount}
                        </span>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">{group.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {group.members.toLocaleString()} members
                  </div>
                  
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-foreground line-clamp-2">
                      {group.lastMessage}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {group.lastActivity}
                    </p>
                  </div>
                  
                  <Button 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    variant="outline"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enter Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;