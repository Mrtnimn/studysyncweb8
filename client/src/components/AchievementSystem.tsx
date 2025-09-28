import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Trophy, 
  Star, 
  Flame, 
  Target, 
  BookOpen, 
  Users, 
  Clock, 
  Zap,
  Award,
  Crown,
  Sparkles,
  Calendar,
  Heart,
  TrendingUp,
  Gift
} from "lucide-react";
import { CelebrationEffect } from "./PageTransition";
import { useAvatarCompanion } from "./AvatarCompanion";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'study' | 'social' | 'streak' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: {
    type: string;
    target: number;
    current?: number;
  };
  earned: boolean;
  earnedDate?: string;
  unlockedAt?: number;
  isNew?: boolean;
}

interface AchievementSystemProps {
  achievements: Achievement[];
  userStats: {
    totalXP: number;
    level: number;
    streak: number;
    studyTime: number;
    sessionsCompleted: number;
    friendsCount: number;
    tutorSessions: number;
  };
  onAchievementUnlocked?: (achievement: Achievement) => void;
}

const achievementCategories = {
  study: { name: 'Study Master', icon: BookOpen, color: 'from-blue-500 to-blue-600' },
  social: { name: 'Social Learner', icon: Users, color: 'from-green-500 to-green-600' },
  streak: { name: 'Consistency King', icon: Flame, color: 'from-orange-500 to-red-600' },
  milestone: { name: 'Milestone Achiever', icon: Target, color: 'from-purple-500 to-purple-600' },
  special: { name: 'Special Edition', icon: Crown, color: 'from-yellow-500 to-yellow-600' }
};

const rarityStyles = {
  common: { 
    border: 'border-gray-300', 
    bg: 'from-gray-50 to-gray-100', 
    glow: 'shadow-gray-200/50',
    particle: '#9CA3AF'
  },
  rare: { 
    border: 'border-blue-300', 
    bg: 'from-blue-50 to-blue-100', 
    glow: 'shadow-blue-200/50',
    particle: '#3B82F6'
  },
  epic: { 
    border: 'border-purple-300', 
    bg: 'from-purple-50 to-purple-100', 
    glow: 'shadow-purple-200/50',
    particle: '#A855F7'
  },
  legendary: { 
    border: 'border-yellow-300', 
    bg: 'from-yellow-50 to-yellow-100', 
    glow: 'shadow-yellow-200/50',
    particle: '#F59E0B'
  }
};

const predefinedAchievements: Achievement[] = [
  {
    id: 'first-session',
    title: 'First Steps',
    description: 'Complete your very first study session',
    icon: '🎯',
    category: 'milestone',
    rarity: 'common',
    points: 100,
    requirements: { type: 'sessions', target: 1, current: 0 },
    earned: true,
    earnedDate: '2024-12-24',
    isNew: false
  },
  {
    id: 'study-streak-7',
    title: 'Week Warrior',
    description: 'Study for 7 days in a row',
    icon: '🔥',
    category: 'streak',
    rarity: 'rare',
    points: 250,
    requirements: { type: 'streak', target: 7, current: 7 },
    earned: true,
    earnedDate: '2024-12-22',
    isNew: false
  },
  {
    id: 'study-hours-10',
    title: 'Time Master',
    description: 'Study for a total of 10 hours',
    icon: '⏰',
    category: 'study',
    rarity: 'rare',
    points: 200,
    requirements: { type: 'studyTime', target: 600, current: 840 },
    earned: true,
    earnedDate: '2024-12-20',
    isNew: false
  },
  {
    id: 'social-butterfly',
    title: 'Social Butterfly',
    description: 'Join 5 different study groups',
    icon: '🦋',
    category: 'social',
    rarity: 'epic',
    points: 300,
    requirements: { type: 'groupSessions', target: 5, current: 3 },
    earned: false
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Study before 8 AM for 5 days',
    icon: '🌅',
    category: 'special',
    rarity: 'epic',
    points: 350,
    requirements: { type: 'earlyStudy', target: 5, current: 2 },
    earned: false
  },
  {
    id: 'knowledge-seeker',
    title: 'Knowledge Seeker',
    description: 'Complete 50 study sessions',
    icon: '📚',
    category: 'milestone',
    rarity: 'legendary',
    points: 500,
    requirements: { type: 'sessions', target: 50, current: 23 },
    earned: false
  },
  {
    id: 'tutor-master',
    title: 'Tutor\'s Pet',
    description: 'Book 10 tutor sessions',
    icon: '👨‍🏫',
    category: 'study',
    rarity: 'epic',
    points: 300,
    requirements: { type: 'tutorSessions', target: 10, current: 0 },
    earned: false
  },
  {
    id: 'study-streak-30',
    title: 'Streak Legend',
    description: 'Study for 30 days in a row',
    icon: '⚡',
    category: 'streak',
    rarity: 'legendary',
    points: 1000,
    requirements: { type: 'streak', target: 30, current: 7 },
    earned: false
  }
];

export function AchievementSystem({ achievements = predefinedAchievements, userStats, onAchievementUnlocked }: AchievementSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const companion = useAvatarCompanion();

  // Check for newly unlocked achievements
  useEffect(() => {
    const checkUnlocks = () => {
      achievements.forEach(achievement => {
        if (!achievement.earned && isAchievementUnlocked(achievement, userStats)) {
          const unlockedAchievement = { ...achievement, earned: true, earnedDate: new Date().toISOString(), isNew: true };
          setNewlyUnlocked(unlockedAchievement);
          setShowUnlockDialog(true);
          setShowCelebration(true);
          companion.celebrate();
          onAchievementUnlocked?.(unlockedAchievement);
        }
      });
    };

    checkUnlocks();
  }, [achievements, userStats, companion, onAchievementUnlocked]);

  const isAchievementUnlocked = (achievement: Achievement, stats: any): boolean => {
    const req = achievement.requirements;
    switch (req.type) {
      case 'sessions':
        return stats.sessionsCompleted >= req.target;
      case 'streak':
        return stats.streak >= req.target;
      case 'studyTime':
        return stats.studyTime >= req.target;
      case 'level':
        return stats.level >= req.target;
      case 'xp':
        return stats.totalXP >= req.target;
      case 'friends':
        return stats.friendsCount >= req.target;
      case 'tutorSessions':
        return stats.tutorSessions >= req.target;
      default:
        return false;
    }
  };

  const getProgress = (achievement: Achievement): number => {
    const req = achievement.requirements;
    let current = 0;
    
    switch (req.type) {
      case 'sessions':
        current = userStats.sessionsCompleted;
        break;
      case 'streak':
        current = userStats.streak;
        break;
      case 'studyTime':
        current = userStats.studyTime;
        break;
      case 'level':
        current = userStats.level;
        break;
      case 'xp':
        current = userStats.totalXP;
        break;
      case 'friends':
        current = userStats.friendsCount;
        break;
      case 'tutorSessions':
        current = userStats.tutorSessions;
        break;
    }
    
    return Math.min((current / req.target) * 100, 100);
  };

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const earnedCount = achievements.filter(a => a.earned).length;
  const totalPoints = achievements.filter(a => a.earned).reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="space-y-6">
      <CelebrationEffect 
        isVisible={showCelebration} 
        onComplete={() => setShowCelebration(false)}
      />

      {/* Achievement Unlock Dialog */}
      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent className="max-w-md text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="space-y-4"
          >
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                rotate: { duration: 1, ease: "easeInOut" },
                scale: { duration: 0.5, repeat: 1, repeatType: "reverse" }
              }}
              className="text-6xl mb-4"
            >
              🏆
            </motion.div>
            
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Achievement Unlocked!
            </h2>
            
            {newlyUnlocked && (
              <>
                <div className="text-4xl mb-2">{newlyUnlocked.icon}</div>
                <h3 className="text-xl font-bold">{newlyUnlocked.title}</h3>
                <p className="text-gray-600">{newlyUnlocked.description}</p>
                <Badge className={`bg-gradient-to-r ${rarityStyles[newlyUnlocked.rarity].bg} text-gray-800 border ${rarityStyles[newlyUnlocked.rarity].border}`}>
                  {newlyUnlocked.rarity.toUpperCase()} • +{newlyUnlocked.points} XP
                </Badge>
              </>
            )}
            
            <Button
              onClick={() => setShowUnlockDialog(false)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Awesome!
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Stats Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{earnedCount}</div>
              <div className="text-sm text-gray-600">Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{achievements.length}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{totalPoints}</div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
          </div>
          <Progress value={(earnedCount / achievements.length) * 100} className="mt-4 h-3" />
        </CardContent>
      </Card>

      {/* Category Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className="rounded-full"
            >
              All Achievements
            </Button>
            {Object.entries(achievementCategories).map(([key, category]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="rounded-full flex items-center gap-1"
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, index) => {
          const progress = getProgress(achievement);
          const rarity = rarityStyles[achievement.rarity];
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <Card 
                className={`
                  relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg
                  ${achievement.earned ? 'shadow-lg ' + rarity.glow : 'opacity-75 hover:opacity-90'}
                  ${rarity.border} border-2
                `}
                onClick={() => setSelectedAchievement(achievement)}
              >
                {/* Rarity Glow Effect */}
                {achievement.earned && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${rarity.bg} opacity-10`} />
                )}
                
                {/* New Badge */}
                {achievement.isNew && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 z-10"
                  >
                    <Badge className="bg-red-500 text-white text-xs">NEW!</Badge>
                  </motion.div>
                )}

                <CardContent className="p-4 relative">
                  <div className="flex items-start gap-3">
                    <motion.div
                      className="text-3xl"
                      animate={achievement.earned ? {
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: achievement.earned ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                    >
                      {achievement.icon}
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm truncate">{achievement.title}</h3>
                        {achievement.earned && (
                          <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {achievement.description}
                      </p>
                      
                      <div className="mt-2 space-y-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${rarity.border} ${rarity.bg}`}
                        >
                          {achievement.rarity.toUpperCase()}
                        </Badge>
                        
                        {!achievement.earned && (
                          <div className="space-y-1">
                            <Progress value={progress} className="h-1" />
                            <div className="text-xs text-gray-500">
                              {Math.round(progress)}% complete
                            </div>
                          </div>
                        )}
                        
                        {achievement.earned && achievement.earnedDate && (
                          <div className="text-xs text-gray-500">
                            Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Achievement Detail Dialog */}
      <Dialog open={!!selectedAchievement} onOpenChange={(open) => !open && setSelectedAchievement(null)}>
        <DialogContent className="max-w-md">
          {selectedAchievement && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="text-6xl">{selectedAchievement.icon}</div>
              
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedAchievement.title}</h2>
                <p className="text-gray-600">{selectedAchievement.description}</p>
              </div>
              
              <div className="space-y-2">
                <Badge className={`${rarityStyles[selectedAchievement.rarity].bg} ${rarityStyles[selectedAchievement.rarity].border} text-gray-800`}>
                  {selectedAchievement.rarity.toUpperCase()} • {selectedAchievement.points} XP
                </Badge>
                
                <Badge variant="outline">
                  {achievementCategories[selectedAchievement.category].name}
                </Badge>
              </div>
              
              {!selectedAchievement.earned && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Progress</div>
                  <Progress value={getProgress(selectedAchievement)} className="h-2" />
                  <div className="text-sm text-gray-500">
                    {Math.round(getProgress(selectedAchievement))}% complete
                  </div>
                </div>
              )}
              
              {selectedAchievement.earned && selectedAchievement.earnedDate && (
                <div className="text-sm text-gray-500">
                  🎉 Earned on {new Date(selectedAchievement.earnedDate).toLocaleDateString()}
                </div>
              )}
              
              <Button
                onClick={() => setSelectedAchievement(null)}
                variant="outline"
                className="mt-4"
              >
                Close
              </Button>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}