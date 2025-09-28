import { GamificationPanel } from '../GamificationPanel';

export default function GamificationPanelExample() {
  //todo: remove mock functionality - replace with real user stats
  const mockStats = {
    currentStreak: 7,
    longestStreak: 15,
    totalXP: 1250,
    level: 8,
    xpToNextLevel: 250,
    totalStudyTime: 840, // minutes
    sessionsCompleted: 23,
    achievements: [
      {
        id: "first-session",
        title: "First Steps",
        description: "Complete your first study session",
        icon: "🎯",
        earned: true,
        earnedDate: "2024-01-15"
      },
      {
        id: "week-streak",
        title: "Week Warrior",
        description: "Study for 7 days in a row",
        icon: "🔥",
        earned: true,
        earnedDate: "2024-01-22"
      },
      {
        id: "early-bird",
        title: "Early Bird",
        description: "Start a study session before 7 AM",
        icon: "🌅",
        earned: true,
        earnedDate: "2024-01-20"
      },
      {
        id: "night-owl",
        title: "Night Owl",
        description: "Study after 10 PM",
        icon: "🦉",
        earned: false,
        progress: 2,
        maxProgress: 5
      }
    ]
  };

  return (
    <div className="max-w-xs">
      <GamificationPanel
        stats={mockStats}
        onViewAchievements={() => console.log('View all achievements clicked')}
      />
    </div>
  );
}