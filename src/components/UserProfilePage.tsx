import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { User, Crown, Users, Activity, Calendar, Edit } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  username: string;
  about_me: string;
  profile_photo_url?: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  created_at: string;
}

interface GroupMembership {
  id: string;
  group: {
    id: string;
    name: string;
    group_type: 'custom' | 'class';
    description?: string;
  };
}

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [groups, setGroups] = useState<GroupMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
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
          group:groups(
            id,
            name,
            group_type,
            description
          )
        `)
        .eq('user_id', user.id);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🔥";
    if (streak >= 14) return "⚡";
    if (streak >= 7) return "💫";
    if (streak >= 3) return "✨";
    return "🌟";
  };

  const customGroups = groups.filter(g => g.group.group_type === 'custom');
  const classGroups = groups.filter(g => g.group.group_type === 'class');
  const groupActivity = Math.min(((customGroups.length / 2) + (classGroups.length / 1)) * 100, 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dark Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(147,51,234,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className={`flex justify-between items-center mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Profile
            </h1>
            <p className="text-gray-300 mt-2">Your Quorum journey</p>
          </div>
          <Button 
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="bg-gray-800/50 backdrop-blur-sm border-gray-700/30 hover:bg-gray-700/50 text-white hover:text-white"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Main Profile Section */}
        <div className={`grid lg:grid-cols-3 gap-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-2 border-blue-500/20 shadow-lg">
                      <AvatarImage src={profile?.profile_photo_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-2xl font-bold">
                        {profile?.username?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 shadow-lg">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-bold text-white">
                        {profile?.username || 'Unknown User'}
                      </h2>
                      {classGroups.length > 0 && (
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Crown className="w-3 h-3 mr-1" />
                          Class Member
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-400 mb-4">
                      {profile?.about_me || "No description yet. Share something about yourself!"}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Joined {profile ? formatDate(profile.created_at) : 'Unknown'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        Last active {profile ? formatDate(profile.last_activity_date) : 'Unknown'}
                      </div>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="outline" className="bg-gray-700/50 backdrop-blur-sm text-white hover:text-white border-gray-600/50 hover:border-blue-500/50 hover:bg-blue-500/20">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {/* Streak Card */}
              <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <span className="text-2xl">{getStreakEmoji(profile?.current_streak || 0)}</span>
                    Daily Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-baseline mb-2">
                        <span className="text-sm text-gray-400">Current Streak</span>
                        <span className="text-3xl font-bold text-blue-400">{profile?.current_streak || 0}</span>
                      </div>
                      <div className="text-xs text-gray-400">days in a row</div>
                    </div>
                    
                    <Separator className="bg-gray-700/50" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Best Streak</span>
                      <span className="text-lg font-semibold text-white">{profile?.longest_streak || 0} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Group Activity */}
              <Card className="bg-gray-800/30 backdrop-blur-lg border-gray-700/30 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg text-white">
                    <Users className="w-5 h-5 text-blue-400" />
                    Group Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Progress</span>
                        <span className="text-sm font-medium text-white">{Math.round(groupActivity)}%</span>
                      </div>
                      <Progress value={groupActivity} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Custom Groups</div>
                        <div className="font-semibold text-white">{customGroups.length}/2</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Class Groups</div>
                        <div className="font-semibold text-white">{classGroups.length}/1</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Groups Sidebar */}
          <div className="space-y-6">
            <Card className="bg-background/30 backdrop-blur-lg border-white/10 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  My Groups
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {groups.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-muted-foreground">No groups joined yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => navigate('/dashboard')}
                      >
                        Find Groups
                      </Button>
                    </div>
                  ) : (
                    groups.map((membership) => (
                      <div 
                        key={membership.id}
                        className="p-3 rounded-lg bg-background/40 border border-white/10 hover:bg-background/60 transition-all duration-300 cursor-pointer"
                        onClick={() => navigate(`/chat/${membership.group.id}`)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium truncate">{membership.group.name}</h4>
                          <Badge 
                            variant={membership.group.group_type === 'class' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {membership.group.group_type === 'class' ? 'Class' : 'Custom'}
                          </Badge>
                        </div>
                        {membership.group.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {membership.group.description}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-background/30 backdrop-blur-lg border-white/10 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-accent" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile?.current_streak && profile.current_streak >= 3 && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-accent/10 border border-accent/20">
                      <span className="text-xl">✨</span>
                      <div>
                        <div className="font-medium text-sm">Streak Starter</div>
                        <div className="text-xs text-muted-foreground">3+ day streak</div>
                      </div>
                    </div>
                  )}
                  
                  {profile?.current_streak && profile.current_streak >= 7 && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-primary/10 border border-primary/20">
                      <span className="text-xl">💫</span>
                      <div>
                        <div className="font-medium text-sm">Week Warrior</div>
                        <div className="text-xs text-muted-foreground">7+ day streak</div>
                      </div>
                    </div>
                  )}
                  
                  {customGroups.length >= 2 && (
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/10 border border-secondary/20">
                      <span className="text-xl">🤝</span>
                      <div>
                        <div className="font-medium text-sm">Group Master</div>
                        <div className="text-xs text-muted-foreground">Joined 2 custom groups</div>
                      </div>
                    </div>
                  )}
                  
                  {groups.length === 0 && (
                    <div className="text-center py-4">
                      <span className="text-4xl mb-2 block">🏆</span>
                      <p className="text-sm text-muted-foreground">Start your journey to unlock achievements!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;