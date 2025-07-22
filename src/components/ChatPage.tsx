import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, Users, MoreVertical } from 'lucide-react';

interface Message {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

const ChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock group data
  const groups = {
    1: { name: "Frontend Developers", members: 1247 },
    2: { name: "Design Systems", members: 892 },
    3: { name: "Tech News", members: 2156 },
    4: { name: "Startup Founders", members: 634 }
  };

  const currentGroup = groups[parseInt(groupId || '1') as keyof typeof groups];

  // Mock messages
  const mockMessages: Message[] = [
    {
      id: 1,
      username: "alex_dev",
      content: "Hey everyone! Just finished implementing the new component library. What do you think about the new design tokens?",
      timestamp: "2:30 PM",
      isOwn: false
    },
    {
      id: 2,
      username: "sarah_ui",
      content: "Looks amazing! The consistency across components is much better now. Great work! 🎉",
      timestamp: "2:32 PM",
      isOwn: false
    },
    {
      id: 3,
      username: "mike_frontend",
      content: "I love how the animations feel so smooth. Did you use Framer Motion for this?",
      timestamp: "2:35 PM",
      isOwn: false
    },
    {
      id: 4,
      username: user?.username || "you",
      content: "This is exactly what we needed! The developer experience is so much better.",
      timestamp: "2:38 PM",
      isOwn: true
    }
  ];

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Update messages to include current user
      setMessages(mockMessages.map(msg => ({
        ...msg,
        isOwn: msg.username === parsedUser.username
      })));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage: Message = {
      id: messages.length + 1,
      username: user.username,
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  if (!user || !currentGroup) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-secondary flex">
      {/* Sidebar */}
      <div className="w-80 bg-white/50 backdrop-blur-sm border-r border-white/20 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/20">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h2 className="text-xl font-bold text-foreground">Your Groups</h2>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Object.entries(groups).map(([id, group]) => (
            <Card 
              key={id}
              className={`cursor-pointer transition-all duration-200 ${
                id === groupId 
                  ? 'bg-primary/10 border-primary/30' 
                  : 'bg-white/30 hover:bg-white/50 border-white/20'
              }`}
              onClick={() => navigate(`/chat/${id}`)}
            >
              <CardContent className="p-4">
                <h3 className={`font-semibold ${id === groupId ? 'text-primary' : 'text-foreground'}`}>
                  {group.name}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center mt-1">
                  <Users className="w-3 h-3 mr-1" />
                  {group.members.toLocaleString()} members
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <header className="bg-white/50 backdrop-blur-sm border-b border-white/20 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{currentGroup.name}</h1>
              <p className="text-muted-foreground flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {currentGroup.members.toLocaleString()} members
              </p>
            </div>
            
            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}
            >
              <div className={`flex max-w-xs md:max-w-md lg:max-w-lg ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
                {!msg.isOwn && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-muted text-xs">
                      {msg.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`${msg.isOwn ? 'mr-3' : ''}`}>
                  {!msg.isOwn && (
                    <p className="text-xs text-muted-foreground mb-1 ml-1">
                      {msg.username}
                    </p>
                  )}
                  
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-white/70 text-foreground border border-white/30'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={`text-xs mt-1 ${
                      msg.isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-white/50 backdrop-blur-sm border-t border-white/20 p-6">
          <form onSubmit={sendMessage} className="flex space-x-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message ${currentGroup.name}...`}
              className="flex-1 bg-white/70 border-white/30"
            />
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90 shadow-glow"
              disabled={!message.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;