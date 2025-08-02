import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Users, Plus, User, Crown, Zap,Settings,Home,Bell,Search,Sparkles,Shield,Calendar,Activity} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { Navigate } from 'react-router-dom';

interface Profile {
  id: string;
  username: string;
  about_me: string;
  profile_photo_url?: string;
  current_streak: number;
}

interface Group {
  id: string;
  name: string;
  description?: string;
  group_type: 'custom' | 'class';
  max_members: number;
  created_by: string;
  created_at: string;
}

interface GroupMembership {
  id: string;
  group: Group;
  joined_at: string;
}

// ReactBits inspired 
const DockItem = ({ 
  icon: Icon, 
  label, 
  active = false, 
  onClick,
  badge
}: { 
  icon: any; 
  label: string; 
  active?: boolean; 
  onClick?: () => void;
  badge?: number;
}) => (
  <div 
    className={`relative group cursor-pointer transition-all duration-300 ${
      active ? 'scale-110' : 'hover:scale-110'
    }`}
    onClick={onClick}
  >
    <div className={`
      flex items-center justify-center w-12 h-12 rounded-2xl backdrop-blur-lg border transition-all duration-300
      ${active 
        ? 'bg-primary text-white border-primary/50 shadow-glow' 
        : 'bg-background/30 text-muted-foreground border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/30'
      }
    `}>
      <Icon className="w-5 h-5" />
      {badge && badge > 0 && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-medium">
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </div>
    
    {/* Tooltip */}
    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
      <div className="bg-background/90 backdrop-blur-sm text-foreground text-xs px-2 py-1 rounded-lg border border-white/10 whitespace-nowrap">
        {label}
      </div>
    </div>
  </div>
);

const Dock = ({ children }: { children: React.ReactNode }) => (
  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
    <div className="flex items-center gap-2 px-4 py-3 bg-background/40 backdrop-blur-xl rounded-3xl border border-white/20 shadow-elegant">
      {children}
    </div>
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<GroupMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    group_type: 'custom' as 'custom' | 'class'
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
    
  }, []);

  useEffect(() => {
    checkUserAndLoadData();

  }, []);

  const checkUserAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      // Update user streak
      await supabase.rpc('update_user_streak', { user_uuid: user.id });

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } else {
        setProfile(profileData);
        
      }

      // Fetch group memberships
      const { data: groupsData, error: groupsError } = await supabase
        .from('group_memberships')
        .select(`
          id,
          joined_at,
          group:groups(
            id,
            name,
            description,
            group_type,
            max_members,
            created_by,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

      if (groupsError) {
        console.error('Error fetching groups:', groupsError);
      } else {
        setGroups(groupsData || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: groupData, error } = await supabase
        .from('groups')
        .insert([{
          name: newGroup.name,
          description: newGroup.description,
          group_type: newGroup.group_type,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create group",
          variant: "destructive",
        });
        return;
      }

      await supabase
        .from('group_memberships')
        .insert([{
          user_id: user.id,
          group_id: groupData.id
        }]);

      toast({
        title: "Success",
        description: "Group created successfully!",
      });

      setCreateGroupOpen(false);
      setNewGroup({ name: '', description: '', group_type: 'custom' });
      checkUserAndLoadData(); // Refresh data
    } catch (error) {
      console.error('Error creating group:', error);
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const customGroups = groups.filter(g => g.group.group_type === 'custom');
  const classGroups = groups.filter(g => g.group.group_type === 'class');
  const canJoinCustom = customGroups.length < 2;
  const canJoinClass = classGroups.length < 1;
  const groupProgress = Math.min(((customGroups.length / 2) + (classGroups.length / 1)) * 100, 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-60 right-32 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <header className={`relative z-10 p-6 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Quorum
            </h1>
            {profile && (
              <Badge variant="outline" className="bg-gray-800/50 backdrop-blur-sm border-blue-500/20 text-white">
                <Zap className="w-3 h-3 mr-1" />
                {profile.current_streak} day streak
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="bg-gray-800/50 backdrop-blur-sm border-blue-500/20 hover:bg-purple-500/100 text-white hover:text-white"
              onClick={() => navigate('/profile')}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        {/* Welcome Section */}
        <div className={`mb-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16 border-2 border-blue-500/20">
              <AvatarImage src={profile?.profile_photo_url} />
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-4xl font-bold text-white">
                Welcome back, {profile?.username || 'User'}! 
                <span className="ml-2">👋</span>
              </h2>
              <p className="text-gray-300 text-lg">
                Ready to spark some conversations?
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className={`grid md:grid-cols-4 gap-6 mb-8 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/30 shadow-xl hover:shadow-2xl hover:shadow-red-500/100 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Total Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{groups.length}</div>
              <div className="text-xs text-gray-400 mt-1">
                {customGroups.length} custom, {classGroups.length} class
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/100 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Group Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{Math.round(groupProgress)}%</span>
                  <span className="text-gray-400">Complete</span>
                </div>
                <Progress value={groupProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/30 shadow-xl hover:shadow-2xl hover:shadow-orange-500/100 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Daily Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-400">{profile?.current_streak || 0}</div>
              <div className="text-xs text-gray-400 mt-1">
                days in a row
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-white">
                {profile ? new Date(profile.id).toLocaleDateString('en-US', { 
                  month: 'short', 
                  year: 'numeric' 
                }) : 'Unknown'}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Quorum user
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Groups Section */}
        <div className={`transition-all duration-700 delay-600 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-3xl font-bold text-white">Your Groups</h3>
            
            <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105">
                  <Plus className="w-4 h-4 mr-2" />
                  Make Group
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800/95 backdrop-blur-xl border-gray-700/30 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Create New Group
                  </DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Start a new community and invite others to join the conversation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Group Name</Label>
                    <Input
                      id="name"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      placeholder="Enter group name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      placeholder="What's this group about?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Group Type</Label>
                    <Select
                      value={newGroup.group_type}
                      onValueChange={(value: 'custom' | 'class') => setNewGroup({ ...newGroup, group_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select group type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="custom" disabled={!canJoinCustom}>
                          Custom Group {!canJoinCustom && '(Limit reached: 2/2)'}
                        </SelectItem>
                        <SelectItem value="class" disabled={!canJoinClass}>
                          Class Group {!canJoinClass && '(Limit reached: 1/1)'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleCreateGroup} 
                    className="w-full bg-gradient-primary text-white"
                    disabled={!newGroup.name.trim() || (!canJoinCustom && newGroup.group_type === 'custom') || (!canJoinClass && newGroup.group_type === 'class')}
                  >
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Group Limits Info */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-background/20 backdrop-blur-sm border-primary/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium">Custom Groups</span>
                  </div>
                  <Badge variant={canJoinCustom ? "default" : "secondary"}>
                    {customGroups.length}/2
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-background/20 backdrop-blur-sm border-accent/20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-accent" />
                    <span className="font-medium">Class Groups</span>
                  </div>
                  <Badge variant={canJoinClass ? "default" : "secondary"}>
                    {classGroups.length}/1
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Groups Grid */}
          {groups.length === 0 ? (
            <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/30 shadow-xl">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-400/50 mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2 text-white">No Groups Yet</h4>
                <p className="text-gray-400 mb-6">
                  Create your first group or join existing ones to start chatting!
                </p>
                <Button 
                  onClick={() => setCreateGroupOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((membership, index) => (
                <Card 
                  key={membership.id} 
                  className="group bg-gray-800/30 backdrop-blur-lg border-gray-700/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => navigate(`/chat/${membership.group.id}`)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl text-white group-hover:text-blue-400 transition-colors flex items-center gap-2">
                        {membership.group.group_type === 'class' && (
                          <Crown className="w-5 h-5 text-yellow-400" />
                        )}
                        {membership.group.name}
                      </CardTitle>
                      <Badge 
                        variant={membership.group.group_type === 'class' ? 'default' : 'secondary'}
                        className={`text-xs ${
                          membership.group.group_type === 'class' 
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' 
                            : 'bg-gray-700/50 text-gray-300 border-gray-600/50'
                        }`}
                      >
                        {membership.group.group_type === 'class' ? 'Class' : 'Custom'}
                      </Badge>
                    </div>
                    {membership.group.description && (
                      <p className="text-gray-400 text-sm">
                        {membership.group.description}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        Joined {new Date(membership.joined_at).toLocaleDateString()}
                      </div>
                      
                      <Button 
                        className="w-full bg-gray-700/50 text-white hover:bg-blue-500/20 hover:text-blue-400 transition-all border border-gray-600/50 hover:border-blue-500/50"
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
          )}
        </div>
      </main>

      {/* ReactBits-inspired Dock */}
      <Dock>
        <DockItem icon={Home} label="Dashboard" active={true} />
        <DockItem icon={MessageCircle} label="Chats" onClick={() => {
          if (groups.length > 0) {
            navigate(`/chat/${groups[0].group.id}`);
          } else {
            navigate('/chat');
          }
        }} />
        <DockItem icon={User} label="Profile" onClick={() => navigate('/profile')} />
        <DockItem icon={Search} label="Discover" onClick={() => navigate('/trial')} />
        
        <DockItem icon={Settings} label="Settings" onClick={handleLogout} />
      </Dock>
    </div>
  );
};

export default DashboardPage;

/**
 * url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><g fill="none" stroke="%236277FF" stroke-width="2"><circle cx="12" cy="12" r="8.5"></circle><path d="M1 12h5M18 12h5M12 6V1.04M12 23v-4.96M11.95 11.95h.1v.1h-.1z"></path></g></svg>')
 * 
 */