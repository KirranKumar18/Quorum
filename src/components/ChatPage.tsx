import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Send, Users, MoreVertical, Copy, LogOut } from 'lucide-react';
import { supabase } from '../integrations/supabase/client.ts';
import { toast } from "@/hooks/use-toast";
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

// Initialize socket connection outside component to prevent reconnections
const socket: Socket = io("http://localhost:8081", {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

interface Message {
  id: number;
  username: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}
interface messageS {
  Sender: string;
  Group: string;
  Message: string;
  timestamp?: string; // Add timestamp if it exists in the response
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  group_type: 'custom' | 'class';
  member_count: number;
  joined_at: string;
}

const ChatPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);                                // the Sender[messageS]
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);       // load this chats and the Group[messageS]
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  // Get user's groups from Supabase
  const fetchUserGroups = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_memberships')
        .select(`
          joined_at,
          groups (
            id,
            name,
            description,
            group_type
          )
        `)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user groups:', error);
        toast({
          title: "Error",
          description: "Failed to load your groups",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        // Transform the data and get member counts 
        const groupsWithCounts = await Promise.all(
          data.map(async (item) => {
            const group = item.groups;

            // Get member count for each group
            const { count } = await supabase
              .from('group_memberships')
              .select('*', { count: 'exact' })
              .eq('group_id', group.id);

            return {
              id: group.id,
              name: group.name,
              description: group.description,
              group_type: group.group_type,
              member_count: count || 0,
              joined_at: item.joined_at
            };
          })
        );

        setUserGroups(groupsWithCounts);

        // Set current group if groupId is provided
        if (groupId) {
          const current = groupsWithCounts.find(g => g.id === groupId);
          setCurrentGroup(current || null);
        } else if (groupsWithCounts.length > 0) {
          // If no groupId, redirect to the first group
          navigate(`/chat/${groupsWithCounts[0].id}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error in fetchUserGroups:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  async function sendMessagetoDB() {
    if (!user?.username || !currentGroup?.id || !message.trim()) {
      console.error("Missing required data to send message");
      return false;
    }

    try {
      console.log(`Sending message - User: ${user.username}, Group: ${currentGroup.name}, Message: ${message}`);
      const response = await axios.post(`http://localhost:8081/api/chat/${currentGroup.id}`, {
        Sender: user.username,
        Group: currentGroup.id,
        Message: message.trim()
      });

      console.log("Message saved successfully:", response.data);
      return true;
    } catch (error) {
      console.error("Error saving message in DB:", error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }

  // Fixed getMessages function with proper error handling
  useEffect(() => {
    setMessage('')
    if (currentGroup) {
      getMessages();
    }
  }, [currentGroup]);

  const getMessages = async () => {
    if (!currentGroup) {
      console.log("No group selected yet, skipping message fetch");
      return;
    }

    try {

      const response = await axios.get(`http://localhost:8081/api/chat/${currentGroup.id}`);

      // Check if response contains messages
      if (response.data && response.data.message) {
        const messagesFromDB = response.data.message;
        console.log("Messages fetched:", messagesFromDB);

        if (Array.isArray(messagesFromDB) && messagesFromDB.length > 0) {
          // Convert DB messages to the Message format used by the UI
          const formattedMessages: Message[] = messagesFromDB.map((msg, index) => {
            return {
              id: index + 1, // Generate IDs based on array index
              username: msg.Sender,
              content: msg.Message,
              timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isOwn: msg.Sender === user?.username
            };
          });

          // Update the messages state with data from DB
          setMessages(formattedMessages);
          console.log("Messages updated with DB data");
        } else {
          console.log("No messages found or empty array returned");
          setMessage('')
        }
      }

    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages for this group.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const checkUserAndLoadGroups = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          navigate('/login');
          return;
        }

        // Get user profile from Supabase
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', authUser.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          navigate('/login');
          return;
        }

        if (profile) {
          setUser(profile);
          // Load user's groups
          await fetchUserGroups(authUser.id);
        }
      } catch (error) {
        console.error('Error checking user:', error);
        navigate('/login');
      }
    };

    checkUserAndLoadGroups();
  }, [navigate]);

  useEffect(() => {
    // Update current group when groupId changes
    if (groupId && userGroups.length > 0) {
      const current = userGroups.find(g => g.id === groupId);
      setCurrentGroup(current || null);
    }
  }, [groupId, userGroups]);

  // Socket.io connection and message handling
  useEffect(() => {
    console.log("🔌 Socket connected status:", socket.connected);

    const onConnect = () => {
      console.log("✅ Socket connected successfully! ID:", socket.id);
      if (currentGroup?.id) {
        socket.emit("joinGroup", currentGroup.id);
      }
    };

    const onDisconnect = (reason: string) => {
      console.log("❌ Socket disconnected. Reason:", reason);
    };

    const onConnectError = (error: Error) => {
      console.error("🚨 Socket connection error:", error.message);
    };

    const onNewMessage = (newMsg: { Grpid: string; Sender: string; Message: string; image?: string }) => {
      console.log("📩 Received new message via socket:", newMsg);
      // Only add messages for the currently selected group
      if (newMsg.Grpid === currentGroup?.id) {
        setMessages((prevMessages) => {
          // Check if message already exists (to prevent duplicates)
          const isDuplicate = prevMessages.some(
            (msg) => 
              msg.username === newMsg.Sender && 
              msg.content === newMsg.Message
          );
          if (isDuplicate) {
            console.log("⚠️ Duplicate message detected, skipping");
            return prevMessages;
          }
          
          const formattedMsg: Message = {
            id: prevMessages.length + 1,
            username: newMsg.Sender,
            content: newMsg.Message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isOwn: newMsg.Sender === user?.username
          };
          return [...prevMessages, formattedMsg];
        });
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("newMessage", onNewMessage);

    // If already connected, join the group
    if (socket.connected && currentGroup?.id) {
      console.log("🔗 Already connected, joining group:", currentGroup.id);
      socket.emit("joinGroup", currentGroup.id);
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("newMessage", onNewMessage);
    };
  }, [currentGroup?.id, user?.username]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentGroup) return;

    const messageContent = message.trim();
    
    // Clear input immediately for better UX
    setMessage('');

    // Send to database
    const sent = await sendMessagetoDB();
    if (!sent) {
      console.log("Message failed to send to database");
      // Restore message if failed
      setMessage(messageContent);
      return;
    }
    
    // Emit via socket for real-time updates to other users
    socket.emit("newMessage", {
      Grpid: currentGroup.id,
      Sender: user.username,
      Message: messageContent,
      image: ''
    });
    console.log("📤 Message emitted via socket");
  };

  const copyGroupId = () => {
    if (currentGroup?.id) {
      navigator.clipboard.writeText(currentGroup.id);
      toast({
        title: "Copied!",
        description: "Group ID copied to clipboard",
        variant: "default",
      });
    }
  };

  const leaveGroup = async () => {
    if (!currentGroup?.id || !user?.user_id) {
      toast({
        title: "Error",
        description: "Unable to leave group. Missing group or user information.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('group_memberships')
        .delete()
        .eq('group_id', currentGroup.id)
        .eq('user_id', user.user_id);

      if (error) {
        console.error('Error leaving group:', error);
        toast({
          title: "Error",
          description: "Failed to leave the group. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Left Group",
        description: `You have successfully left "${currentGroup.name}"`,
        variant: "default",
      });

      // Remove the group from the local state
      const updatedGroups = userGroups.filter(g => g.id !== currentGroup.id);
      setUserGroups(updatedGroups);

      // Navigate to another group or dashboard
      if (updatedGroups.length > 0) {
        navigate(`/chat/${updatedGroups[0].id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error in leaveGroup:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while leaving the group.",
        variant: "destructive",
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your groups...</p>
        </div>
      </div>
    );
  }

  if (userGroups.length === 0) {
    return (
      <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-white">No Groups Found</h2>
          <p className="text-gray-300 mb-6">
            You haven't joined any groups yet. Join a group to start chatting!
          </p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-gray-800/30 backdrop-blur-lg border-r border-gray-700/30 flex flex-col h-full relative z-10">
        {/* Sidebar Header */}
        <div className={`p-6 border-b border-gray-700/30 flex-shrink-0 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <Button
            variant="outline"
            className="mb-4 bg-gray-800/50 backdrop-blur-sm border-blue-500/20 hover:bg-purple-500/100 text-white hover:text-white"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <h2 className="text-xl font-bold text-white">Your Groups</h2>
        </div>

        {/* Groups List */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-3 min-h-0 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {userGroups.map((group) => (
            <Card
              key={group.id}
              className={`cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl ${group.id === groupId
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 shadow-blue-500/30 shadow-glow'
                  : 'bg-gray-800/30 backdrop-blur-lg border-gray-700/30 hover:border-blue-500/20'
                }`}
              onClick={() => navigate(`/chat/${group.id}`)}
            >
              <CardContent className="p-4">
                <h3 className={`font-semibold ${group.id === groupId ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent' : 'text-white'}`}>
                  {group.name}
                </h3>
                <p className={`text-sm flex items-center mt-1 ${group.id === groupId ? 'text-blue-300' : 'text-gray-300'}`}>
                  <Users className="w-3 h-3 mr-1" />
                  {group.member_count.toLocaleString()} members
                </p>
                {group.description && (
                  <p className={`text-xs mt-1 truncate ${group.id === groupId ? 'text-blue-200' : 'text-gray-400'}`}>
                    {group.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${group.group_type === 'class'
                      ? group.id === groupId ? 'bg-blue-500/30 text-blue-200' : 'bg-blue-500/20 text-blue-300'
                      : group.id === groupId ? 'bg-green-500/30 text-green-200' : 'bg-green-500/20 text-green-300'
                    }`}>
                    {group.group_type === 'class' ? 'Class' : 'Custom'}
                  </span>
                  <span className={`text-xs ${group.id === groupId ? 'text-blue-200' : 'text-gray-400'}`}>
                    Joined {new Date(group.joined_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative z-10">
        {/* Chat Header */}
        <header className={`bg-gray-800/30 backdrop-blur-lg border-b border-gray-700/30 p-6 flex-shrink-0 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {currentGroup?.name || 'Select a Group'}
              </h1>
              {currentGroup && (
                <div className="flex items-center space-x-4 mt-1">
                  <p className="text-gray-300 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {currentGroup.member_count.toLocaleString()} members
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${currentGroup.group_type === 'class'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-green-500/20 text-green-300'
                    }`}>
                    {currentGroup.group_type === 'class' ? 'Class Group' : 'Custom Group'}
                  </span>
                </div>
              )}
            </div>

            {currentGroup && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-800/50 backdrop-blur-sm border-blue-500/20 hover:bg-purple-500/100 text-white hover:text-white"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                  <DropdownMenuItem
                    className="flex items-center hover:bg-gray-700 cursor-pointer"
                    onClick={copyGroupId}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    <div>
                      <div className="text-sm">Group ID</div>
                      <div className="text-xs text-gray-400 max-w-xs truncate">
                        {currentGroup.id}
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center hover:bg-red-600/50 cursor-pointer text-red-400 hover:text-red-300"
                    onClick={leaveGroup}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    <div className="text-sm">Leave Group</div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!currentGroup && (
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-800/50 backdrop-blur-sm border-blue-500/20 hover:bg-purple-500/100 text-white hover:text-white"
                disabled
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-gray-900/40 transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {!currentGroup ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  Select a group to start chatting
                </h3>
                <p className="text-gray-400">
                  Choose a group from the sidebar to view messages and participate in conversations.
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-400">
                  Be the first to send a message in this group!
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}
                >
                  <div className={`flex max-w-xs md:max-w-md lg:max-w-lg ${msg.isOwn ? 'flex-row-reverse' : 'flex-row'} space-x-3`}>
                    {!msg.isOwn && (
                      <Avatar className="h-8 w-8 mt-1 flex-shrink-0 border border-blue-500/20">
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                          {msg.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className={`${msg.isOwn ? 'mr-3' : ''}`}>
                      {!msg.isOwn && (
                        <p className="text-xs text-gray-400 mb-1 ml-1">
                          {msg.username}
                        </p>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-3 ${msg.isOwn
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-glow'
                            : 'bg-gray-800/70 text-white border border-gray-700/30'
                          }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.isOwn ? 'text-white/70' : 'text-gray-400'
                          }`}>
                          {msg.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className={`bg-gray-800/30 backdrop-blur-lg border-t border-gray-700/30 p-6 flex-shrink-0 transition-all duration-700 delay-800 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <form onSubmit={sendMessage} className="flex space-x-4">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message ${currentGroup?.name || 'the group'}...`}
              className="flex-1 bg-gray-800/50 border-gray-700/30 text-white placeholder:text-gray-400"
              disabled={!currentGroup}
            />
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300"
              disabled={!message.trim() || !currentGroup}
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

/**
 * Example of using axios with proper CORS handling:
 * 
 * import React from 'react';
 * import axios from 'axios';
 * 
 * function App() {
 *   const handleClick = async () => {
 *     try {
 *       const response = await axios.post('http://localhost:8081/api/data', {
 *         name: 'Kirran',
 *         age: 21,
 *       });
 *       console.log('Response:', response.data);
 *     } catch (error) {
 *       console.error('Error:', error);
 *     }
 *   };
 *
 *   return <button onClick={handleClick}>Send</button>;
 * }
 * 
 * export default App;
 */
