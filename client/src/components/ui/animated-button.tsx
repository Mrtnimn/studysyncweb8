import * as React from "react";
import { motion } from "framer-motion";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Sparkles, Zap } from "lucide-react";

const animatedButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        duolingo: "bg-gradient-to-r from-green-500 to-green-600 text-white font-bold border-b-4 border-green-700 hover:from-green-600 hover:to-green-700 active:border-b-2 active:translate-y-0.5",
        success: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold border-b-4 border-emerald-700 hover:from-emerald-600 hover:to-emerald-700",
        warning: "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold border-b-4 border-amber-700 hover:from-amber-600 hover:to-amber-700",
        magic: "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-bold border-b-4 border-purple-700 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        bounce: "",
        pulse: "",
        shake: "",
        wiggle: "",
        sparkle: "",
        glow: "",
        rainbow: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none",
    },
  }
);

const buttonAnimations = {
  bounce: {
    whileHover: { 
      scale: 1.05,
      y: -2,
      transition: { type: "spring", stiffness: 400, damping: 17 }
    },
    whileTap: { 
      scale: 0.95,
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 17 }
    }
  },
  pulse: {
    whileHover: {
      scale: [1, 1.05, 1],
      transition: { 
        repeat: Infinity, 
        duration: 1.5,
        ease: "easeInOut"
      }
    },
    whileTap: { scale: 0.95 }
  },
  shake: {
    whileHover: {
      x: [-1, 1, -1, 1, 0],
      transition: { 
        repeat: Infinity, 
        duration: 0.5,
        ease: "easeInOut"
      }
    },
    whileTap: { scale: 0.95 }
  },
  wiggle: {
    whileHover: {
      rotate: [0, -5, 5, -5, 5, 0],
      transition: { 
        repeat: Infinity, 
        duration: 1,
        ease: "easeInOut"
      }
    },
    whileTap: { scale: 0.95 }
  },
  sparkle: {
    whileHover: { 
      scale: 1.05,
      boxShadow: "0 0 20px rgba(255, 215, 0, 0.6)"
    },
    whileTap: { scale: 0.95 }
  },
  glow: {
    whileHover: {
      boxShadow: [
        "0 0 0px rgba(59, 130, 246, 0.5)",
        "0 0 20px rgba(59, 130, 246, 0.8)",
        "0 0 0px rgba(59, 130, 246, 0.5)"
      ],
      transition: { 
        repeat: Infinity, 
        duration: 2,
        ease: "easeInOut"
      }
    },
    whileTap: { scale: 0.95 }
  },
  rainbow: {
    whileHover: {
      background: [
        "linear-gradient(45deg, #ff0000, #ff7f00)",
        "linear-gradient(45deg, #ff7f00, #ffff00)",
        "linear-gradient(45deg, #ffff00, #00ff00)",
        "linear-gradient(45deg, #00ff00, #0000ff)",
        "linear-gradient(45deg, #0000ff, #4b0082)",
        "linear-gradient(45deg, #4b0082, #9400d3)",
        "linear-gradient(45deg, #9400d3, #ff0000)"
      ],
      transition: { 
        repeat: Infinity, 
        duration: 3,
        ease: "linear"
      }
    },
    whileTap: { scale: 0.95 }
  }
};

export interface AnimatedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof animatedButtonVariants> {
  asChild?: boolean;
  showSparkles?: boolean;
  glowColor?: string;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant, size, animation = "bounce", asChild = false, showSparkles = false, children, ...props }, ref) => {
    const animationProps = animation && animation !== "none" && buttonAnimations[animation] ? buttonAnimations[animation] : {};

    if (asChild) {
      return (
        <Slot
          className={cn(animatedButtonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <motion.button
        className={cn(animatedButtonVariants({ variant, size, className }))}
        ref={ref}
        {...animationProps}
        {...props}
      >
        {/* Sparkle Effect */}
        {showSparkles && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                style={{
                  left: `${20 + i * 30}%`,
                  top: `${20 + i * 20}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Ripple Effect */}
        <motion.div
          className="absolute inset-0 rounded-md"
          whileTap={{
            background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </Comp>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton, animatedButtonVariants };