import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Heart, Star, Trophy, BookOpen, Timer, 
  MessageCircle, Lightbulb, Target, Zap 
} from "lucide-react";

interface AvatarCompanionProps {
  mood?: 'happy' | 'excited' | 'encouraging' | 'celebrating' | 'focused' | 'sleepy';
  message?: string;
  showMessage?: boolean;
  onInteraction?: () => void;
  size?: 'small' | 'medium' | 'large';
  position?: 'fixed' | 'relative';
}

const avatarExpressions = {
  happy: "😊",
  excited: "🤩", 
  encouraging: "💪",
  celebrating: "🎉",
  focused: "🧠",
  sleepy: "😴"
};

const companionMessages = {
  welcome: [
    "Ready to learn something amazing today? 🌟",
    "Let's make today a productive study day! 📚",
    "I'm here to help you stay focused! 💪",
    "Time to unlock your potential! 🔑"
  ],
  encouragement: [
    "You're doing great! Keep going! 🚀",
    "Every minute counts! You've got this! ⭐",
    "Focus mode activated! Let's study! 🎯",
    "Your dedication is inspiring! 💖"
  ],
  celebration: [
    "Fantastic work! You're on fire! 🔥",
    "Achievement unlocked! Amazing! 🏆",
    "You're building great study habits! 🌱",
    "Success feels good, doesn't it? ✨"
  ],
  break: [
    "Time for a well-deserved break! 🌸",
    "Rest up, you've earned it! 😌",
    "Stretch, breathe, and relax! 🧘‍♀️",
    "Great session! Ready for more? 💪"
  ]
};

export function AvatarCompanion({ 
  mood = 'happy', 
  message, 
  showMessage = false, 
  onInteraction,
  size = 'medium',
  position = 'relative'
}: AvatarCompanionProps) {
  const [currentMessage, setCurrentMessage] = useState(message);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [floatingIcons, setFloatingIcons] = useState<Array<{ id: number; icon: React.ReactNode }>>([]);

  // Auto-blink animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Generate floating icons on hover
  useEffect(() => {
    if (isHovered) {
      const icons = [<Sparkles />, <Heart />, <Star />, <Zap />, <Lightbulb />];
      const newFloatingIcons = Array.from({ length: 3 }, (_, i) => ({
        id: Date.now() + i,
        icon: icons[Math.floor(Math.random() * icons.length)]
      }));
      setFloatingIcons(newFloatingIcons);

      const timeout = setTimeout(() => setFloatingIcons([]), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isHovered]);

  const sizeClasses = {
    small: "w-16 h-16 text-3xl",
    medium: "w-24 h-24 text-5xl", 
    large: "w-32 h-32 text-7xl"
  };

  const positionClasses = position === 'fixed' 
    ? "fixed bottom-6 right-6 z-50" 
    : "relative";

  const avatarVariants = {
    idle: {
      scale: 1,
      rotate: 0,
      y: 0,
    },
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      y: -5,
      transition: {
        rotate: {
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        },
        scale: {
          duration: 0.2
        },
        y: {
          duration: 0.2
        }
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  const messageVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <div className={`${positionClasses} flex flex-col items-center gap-3`}>
      {/* Floating Icons */}
      <AnimatePresence>
        {floatingIcons.map((item, index) => (
          <motion.div
            key={item.id}
            className="absolute text-yellow-400"
            initial={{ 
              opacity: 0, 
              scale: 0, 
              x: 0, 
              y: 0 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: (index - 1) * 40 + Math.random() * 20, 
              y: -50 - Math.random() * 30 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0, 
              y: -80 
            }}
            transition={{ 
              duration: 1.5,
              ease: "easeOut"
            }}
          >
            {item.icon}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Message Bubble */}
      <AnimatePresence>
        {(showMessage || currentMessage) && (
          <motion.div
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="mb-2"
          >
            <Card className="max-w-xs bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-lg">
              <CardContent className="p-3">
                <p className="text-white text-sm font-medium text-center">
                  {currentMessage || companionMessages.welcome[0]}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar */}
      <motion.div
        className={`${sizeClasses[size]} ${position === 'fixed' ? 'cursor-pointer' : ''} 
          bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 
          rounded-full flex items-center justify-center shadow-xl
          border-4 border-white relative overflow-hidden`}
        variants={avatarVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onInteraction}
      >
        {/* Sparkle Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 to-pink-200/20"
          animate={{
            opacity: [0, 1, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
        />
        
        {/* Main Avatar Face */}
        <motion.div
          className="text-white relative z-10 select-none"
          animate={{
            scale: isBlinking ? [1, 1, 0.1, 1] : 1,
          }}
          transition={{
            duration: 0.15,
            times: [0, 0.5, 0.8, 1]
          }}
        >
          {avatarExpressions[mood]}
        </motion.div>

        {/* Energy Ring */}
        <motion.div
          className="absolute inset-0 border-2 border-yellow-300/50 rounded-full"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Mood Badge */}
      {position === 'relative' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 border-purple-200"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {mood.charAt(0).toUpperCase() + mood.slice(1)}
          </Badge>
        </motion.div>
      )}
    </div>
  );
}

// Companion Manager Hook
export function useAvatarCompanion() {
  const [mood, setMood] = useState<AvatarCompanionProps['mood']>('happy');
  const [message, setMessage] = useState<string>('');
  const [showMessage, setShowMessage] = useState(false);

  const showEncouragement = () => {
    const messages = companionMessages.encouragement;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);
    setMood('encouraging');
    setShowMessage(true);
    
    setTimeout(() => setShowMessage(false), 4000);
  };

  const celebrate = () => {
    const messages = companionMessages.celebration;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);
    setMood('celebrating');
    setShowMessage(true);
    
    setTimeout(() => setShowMessage(false), 5000);
  };

  const suggestBreak = () => {
    const messages = companionMessages.break;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);
    setMood('sleepy');
    setShowMessage(true);
    
    setTimeout(() => setShowMessage(false), 4000);
  };

  const welcome = () => {
    const messages = companionMessages.welcome;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setMessage(randomMessage);
    setMood('excited');
    setShowMessage(true);
    
    setTimeout(() => setShowMessage(false), 4000);
  };

  return {
    mood,
    message,
    showMessage,
    setMood,
    setMessage,
    setShowMessage,
    showEncouragement,
    celebrate,
    suggestBreak,
    welcome
  };
}