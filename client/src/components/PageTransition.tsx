import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  transition?: 'slide' | 'fade' | 'scale' | 'bounce' | 'duolingo';
}

const transitionVariants = {
  slide: {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { type: "spring", stiffness: 400, damping: 25 }
  },
  bounce: {
    initial: { y: 50, opacity: 0, scale: 0.9 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -50, opacity: 0, scale: 0.9 },
    transition: { type: "spring", stiffness: 500, damping: 30 }
  },
  duolingo: {
    initial: { 
      scale: 0.8, 
      opacity: 0, 
      y: 30,
      rotateX: -15
    },
    animate: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        delayChildren: 0.1,
        staggerChildren: 0.05
      }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0, 
      y: -30,
      rotateX: 15,
      transition: {
        duration: 0.2
      }
    }
  }
};

export function PageTransition({ 
  children, 
  className = "", 
  transition = 'duolingo' 
}: PageTransitionProps) {
  const variants = transitionVariants[transition];

  return (
    <motion.div
      className={className}
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={'transition' in variants ? variants.transition : { duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Staggered Children Animation
export function StaggeredContainer({ 
  children, 
  className = "",
  staggerDelay = 0.1 
}: { 
  children: ReactNode; 
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: 0.1,
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Individual staggered item
export function StaggeredItem({ 
  children, 
  className = "",
  delay = 0 
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { 
          opacity: 0, 
          y: 20,
          scale: 0.95
        },
        visible: { 
          opacity: 1, 
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 25,
            delay
          }
        }
      }}
    >
      {children}
    </motion.div>
  );
}

// Card hover animations
export function AnimatedCard({ 
  children, 
  className = "",
  hoverScale = 1.02,
  tapScale = 0.98
}: { 
  children: ReactNode; 
  className?: string;
  hoverScale?: number;
  tapScale?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: hoverScale,
        y: -5,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      whileTap={{ 
        scale: tapScale,
        transition: { duration: 0.1 }
      }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25
      }}
    >
      {children}
    </motion.div>
  );
}

// Success celebration animation
export function CelebrationEffect({ 
  isVisible = false,
  onComplete 
}: { 
  isVisible: boolean;
  onComplete?: () => void;
}) {
  const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57'];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          {/* Confetti */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: confettiColors[i % confettiColors.length],
                left: '50%',
                top: '50%'
              }}
              initial={{
                scale: 0,
                x: 0,
                y: 0,
                rotate: 0
              }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos(i * 18) * (100 + Math.random() * 200),
                y: Math.sin(i * 18) * (100 + Math.random() * 200),
                rotate: 360
              }}
              transition={{
                duration: 2,
                ease: "easeOut"
              }}
            />
          ))}
          
          {/* Central burst */}
          <motion.div
            className="text-6xl"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: [0, 1.2, 1], rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
          >
            🎉
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}