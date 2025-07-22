import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Send, Users } from 'lucide-react';

interface Message {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

const GuestChatPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [guestName] = useState(`Guest${Math.floor(Math.random() * 1000)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock messages for guest chat
  const mockMessages: Message[] = [
    {
      id: 1,
      username: "demo_user",
      content: "Welcome to GroupFlow! This is a demo of our group chat experience.",
      timestamp: "2:30 PM",
      isOwn: false
    },
    {
      id: 2,
      username: "sarah_demo",
      content: "Feel free to send a message and see how smooth the experience is! ✨",
      timestamp: "2:32 PM",
      isOwn: false
    },
    {
      id: 3,
      username: "alex_demo",
      content: "This is just a preview - sign up to join real conversations with thousands of members!",
      timestamp: "2:35 PM",
      isOwn: false
    }
  ];

  useEffect(() => {
    setMessages(mockMessages);
  }, []);

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
      username: guestName,
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate a response after a short delay
    setTimeout(() => {
      const responseMessage: Message = {
        id: messages.length + 2,
        username: "demo_bot",
        content: "Thanks for trying out GroupFlow! To continue the conversation and join real groups, please sign up. 🚀",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="bg-white/50 backdrop-blur-sm border-b border-white/20 p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/signup')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Signup
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Demo Chat Room</h1>
              <p className="text-muted-foreground flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Guest preview
              </p>
            </div>
          </div>
          
          <div className="space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 shadow-glow"
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Demo Banner */}
      <div className="bg-primary/10 border-b border-primary/20 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary font-medium">
            🎉 You're viewing a demo chat room as {guestName}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Sign up to join real conversations and connect with thousands of members!
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-200px)]">
        {/* Messages */}
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
              placeholder="Type your message..."
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
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            This is a limited demo. Sign up to unlock full chat features!
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestChatPage;