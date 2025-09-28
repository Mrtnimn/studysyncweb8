import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Users, BookOpen, Timer, TrendingUp, Plus, Sparkles, Heart, Award, Zap, Loader2 } from "lucide-react";
import { StudyRoomCard, type StudyRoom } from "./StudyRoomCard";
import { TutorCard, type Tutor } from "./TutorCard";
import { GamificationPanel, type UserStats } from "./GamificationPanel";
import { StudyTimer } from "./StudyTimer";
import { AvatarCompanion, useAvatarCompanion } from "./AvatarCompanion";
import { PageTransition, StaggeredContainer, StaggeredItem, AnimatedCard, CelebrationEffect } from "./PageTransition";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  study_level: number | null;
  total_xp: number | null;
  study_streak: number | null;
  longest_streak: number | null;
  name: string;
}

interface DashboardProps {
  user: User;
  onCreateRoom?: () => void;
  onJoinRoom?: (roomId: string) => void;
  onBookTutor?: (tutorId: string) => void;
}

export function Dashboard({ user, onCreateRoom, onJoinRoom, onBookTutor }: DashboardProps) {
  const [selectedView, setSelectedView] = useState<"overview" | "study-rooms" | "tutors">("overview");
  const [showCelebration, setShowCelebration] = useState(false);
  const [motivationalMessage, setMotivationalMessage] = useState("");
  const companion = useAvatarCompanion();
  const { toast } = useToast();

  // Fetch user study sessions
  const { data: userSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['/api/sessions/me'],
    enabled: !!user
  });

  // Fetch user achievements
  const { data: userAchievements, isLoading: achievementsLoading } = useQuery({
    queryKey: ['/api/achievements/me'],
    enabled: !!user
  });

  // Fetch active study rooms
  const { data: studyRooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['/api/rooms'],
    enabled: !!user
  });

  // Create computed stats from user and API data
  const userStats: UserStats = {
    currentStreak: user?.study_streak || 0,
    longestStreak: user?.longest_streak || 0,
    totalXP: user?.total_xp || 0,
    level: user?.study_level || 1,
    xpToNextLevel: Math.max(0, (((user?.study_level || 1) + 1) * 200) - (user?.total_xp || 0)),
    totalStudyTime: Array.isArray(userSessions) 
      ? userSessions.reduce((total: number, session: any) => total + (session.duration_minutes || 0), 0) 
      : 0,
    sessionsCompleted: Array.isArray(userSessions) ? userSessions.length : 0,
    achievements: Array.isArray(userAchievements) 
      ? userAchievements.map((ua: any) => ({
          id: ua.achievement.id,
          title: ua.achievement.name,
          description: ua.achievement.description,
          icon: ua.achievement.icon,
          earned: true,
          earnedDate: new Date(ua.unlocked_at).toISOString().split('T')[0]
        })) 
      : []
  };

  // Welcome user with celebration and motivation
  useEffect(() => {
    const welcomeMessages = [
      "Welcome back! Ready to conquer your goals today?",
      "Your streak is looking amazing! Let's keep it going!",
      "Time to unlock new achievements! You've got this!",
      "Another day, another opportunity to grow!"
    ];
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    setMotivationalMessage(randomMessage);
    
    // Show celebration for streak milestones
    const currentStreak = userStats.currentStreak;
    if (currentStreak % 7 === 0 && currentStreak > 0) {
      setShowCelebration(true);
      companion.celebrate();
    }
  }, [companion, userStats.currentStreak]);

  // Transform API study rooms data to match StudyRoom interface
  const activeStudyRooms: StudyRoom[] = Array.isArray(studyRooms) 
    ? studyRooms.map((room: any) => ({
        id: room.id,
        title: room.name,
        description: room.description || `Join this ${room.subject} study session`,
        subject: room.subject || 'General',
        participants: room.current_participants || 0,
        maxParticipants: room.max_participants || 8,
        duration: "2h", // Default duration - could be enhanced later
        rating: 4.5, // Default rating - could be enhanced later
        isPrivate: !room.is_active,
        host: { name: "StudySync Host" }, // Default host - could be enhanced with real host data
        tags: [room.subject, room.level_requirement || 'Beginner'],
        hasVideo: true // Default to true
      }))
    : [];

  // Show loading state for data that's still loading
  const isLoading = sessionsLoading || achievementsLoading || roomsLoading;

  // Mock tutors for now - TODO: implement real tutors API
  const mockTutors: Tutor[] = [
    {
      id: "tutor-1",
      name: "Maria Rodriguez",
      rating: 4.9,
      totalReviews: 127,
      hourlyRate: 1,
      subjects: ["Spanish", "Literature", "Writing"],
      bio: "Native Spanish speaker with 8+ years of teaching experience.",
      availability: "Mon-Fri 9AM-6PM EAT",
      totalSessions: 340,
      responseTime: "< 2 hours",
      isOnline: true,
      languages: ["Spanish", "English"]
    },
    {
      id: "tutor-2",
      name: "James Wilson",
      rating: 4.7,
      totalReviews: 89,
      hourlyRate: 1,
      subjects: ["Physics", "Mathematics", "Engineering"],
      bio: "PhD in Physics with expertise in quantum mechanics and applied mathematics.",
      availability: "Weekends 2PM-8PM EAT",
      totalSessions: 156,
      responseTime: "< 4 hours",
      isOnline: false,
      languages: ["English"]
    }
  ];

  const quickActions = [
    {
      title: "Start Solo Study",
      description: "Focus time with customizable environment",
      icon: BookOpen,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      action: () => console.log("Start solo study"),
      emoji: "📚"
    },
    {
      title: "Join Study Room",
      description: "Collaborate with other students",
      icon: Users,
      color: "bg-gradient-to-r from-green-500 to-emerald-600",
      hoverColor: "hover:from-green-600 hover:to-emerald-700",
      action: () => setSelectedView("study-rooms"),
      emoji: "👥"
    },
    {
      title: "Book a Tutor",
      description: "Get personalized help for $1/hour",
      icon: CalendarDays,
      color: "bg-gradient-to-r from-purple-500 to-pink-600",
      hoverColor: "hover:from-purple-600 hover:to-pink-700",
      action: () => setSelectedView("tutors"),
      emoji: "🎯"
    },
    {
      title: "Study Timer",
      description: "Pomodoro and custom timers",
      icon: Timer,
      color: "bg-gradient-to-r from-orange-500 to-red-600",
      hoverColor: "hover:from-orange-600 hover:to-red-700",
      action: () => console.log("Open timer"),
      emoji: "⏰"
    }
  ];

  if (selectedView === "study-rooms") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-['Poppins']">Study Rooms</h1>
            <p className="text-muted-foreground">Join collaborative study sessions with other students</p>
          </div>
          <Button
            onClick={() => {
              onCreateRoom?.();
              console.log("Create new room");
            }}
            data-testid="button-create-room"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading study rooms...</span>
            </div>
          ) : activeStudyRooms.length > 0 ? (
            activeStudyRooms.map((room: StudyRoom) => (
              <StudyRoomCard
                key={room.id}
                room={room}
                onJoin={onJoinRoom}
              />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No active study rooms available.</p>
              <p className="text-sm mt-1">Why not create your own?</p>
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setSelectedView("overview")}
          data-testid="button-back-dashboard"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (selectedView === "tutors") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-['Poppins']">Available Tutors</h1>
          <p className="text-muted-foreground">Book one-on-one sessions with expert tutors for just $1/hour</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockTutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              onBook={onBookTutor}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={() => setSelectedView("overview")}
          data-testid="button-back-dashboard"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <PageTransition className="space-y-6">
      <CelebrationEffect 
        isVisible={showCelebration} 
        onComplete={() => setShowCelebration(false)}
      />
      
      {/* Enhanced Welcome Section */}
      <StaggeredContainer className="space-y-4">
        <StaggeredItem>
          <motion.div 
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 p-6 text-white"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-2">
                <motion.h1 
                  className="text-3xl font-bold font-['Poppins']"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Welcome back, {user?.display_name || user?.name || user?.username}!
                </motion.h1>
                <motion.p 
                  className="text-white/90 text-lg"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {motivationalMessage}
                </motion.p>
                <motion.div 
                  className="flex items-center gap-3 mt-3"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {userStats.currentStreak} day streak
                  </Badge>
                  <Badge className="bg-white/20 text-white border-white/30">
                    <Award className="w-3 h-3 mr-1" />
                    Level {userStats.level}
                  </Badge>
                </motion.div>
              </div>
              <motion.div
                className="text-6xl opacity-20"
                animate={{ 
                  rotate: [0, -5, 5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                🚀
              </motion.div>
            </div>
          </motion.div>
        </StaggeredItem>
      </StaggeredContainer>

      {/* Enhanced Quick Actions Grid */}
      <StaggeredContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action, index) => (
          <StaggeredItem key={index} delay={index * 0.1}>
            <motion.div
              className="group cursor-pointer"
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              data-testid={`quick-action-${action.title.toLowerCase().replace(' ', '-')}`}
            >
              <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className={`absolute inset-0 ${action.color} opacity-90`} />
                <CardContent className="relative z-10 p-6 text-white">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <motion.div 
                      className="text-4xl"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, -5, 5, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.5,
                        ease: "easeInOut"
                      }}
                    >
                      {action.emoji}
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-lg font-['Poppins']">{action.title}</h3>
                      <p className="text-white/80 text-sm mt-1">{action.description}</p>
                    </div>
                    <motion.div 
                      className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <action.icon className="w-4 h-4" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </StaggeredItem>
        ))}
      </StaggeredContainer>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Featured Study Rooms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>Popular Study Rooms</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedView("study-rooms")}
                  data-testid="button-view-all-rooms"
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading...</span>
                  </div>
                ) : activeStudyRooms.length > 0 ? (
                  activeStudyRooms.slice(0, 2).map((room: StudyRoom) => (
                    <StudyRoomCard key={room.id} room={room} onJoin={onJoinRoom} />
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No active study rooms</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available Tutors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  <span>Top Tutors</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedView("tutors")}
                  data-testid="button-view-all-tutors"
                >
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {mockTutors.slice(0, 2).map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} onBook={onBookTutor} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Study Timer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5" />
                <span>Focus Timer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StudyTimer
                onSessionComplete={(duration) => console.log(`Session completed: ${duration} minutes`)}
                onSessionStart={() => console.log('Session started')}
                onSessionPause={() => console.log('Session paused')}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Gamification Panel */}
        <div className="space-y-6">
          <GamificationPanel
            stats={userStats}
            onViewAchievements={() => console.log('View achievements')}
          />
        </div>
      </div>
    </PageTransition>
  );
}