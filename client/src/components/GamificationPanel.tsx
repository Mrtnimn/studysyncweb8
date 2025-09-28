import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Flame, Target, Clock } from "lucide-react";

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  totalStudyTime: number;
  sessionsCompleted: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
}

interface GamificationPanelProps {
  stats: UserStats;
  onViewAchievements?: () => void;
}

export function GamificationPanel({ stats, onViewAchievements }: GamificationPanelProps) {
  const progressPercentage = (stats.xpToNextLevel / (stats.xpToNextLevel + 500)) * 100;
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const recentAchievements = stats.achievements.filter(a => a.earned).slice(0, 3);

  return (
    <div className="space-y-4" data-testid="gamification-panel">
      {/* XP and Level */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-yellow-500" />
            Level {stats.level}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">XP Progress</span>
            <span className="font-medium">{stats.totalXP} XP</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="text-xs text-muted-foreground text-center">
            {stats.xpToNextLevel} XP to next level
          </div>
        </CardContent>
      </Card>

      {/* Study Streak */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="w-5 h-5 text-orange-500" />
            Study Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-orange-500">{stats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">days in a row</div>
            <Badge variant="outline" className="text-xs">
              Best: {stats.longestStreak} days
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Study Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-green-500" />
            Study Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.sessionsCompleted}</div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-500">{formatTime(stats.totalStudyTime)}</div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-lg">Achievements</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {stats.achievements.filter(a => a.earned).length}/{stats.achievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
                data-testid={`achievement-${achievement.id}`}
              >
                <div className="text-lg">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{achievement.title}</div>
                  <div className="text-xs text-muted-foreground">{achievement.description}</div>
                </div>
              </div>
            ))}
            
            {recentAchievements.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-4">
                Complete your first study session to earn achievements!
              </div>
            )}
            
            <button
              onClick={() => {
                onViewAchievements?.();
                console.log("View all achievements clicked");
              }}
              className="w-full text-sm text-primary hover:underline mt-2"
              data-testid="button-view-achievements"
            >
              View all achievements
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}