import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  Trophy, 
  ArrowRight, 
  ArrowLeft, 
  Star,
  Brain,
  Heart,
  Target,
  Gift,
  Zap
} from "lucide-react";
import { AvatarCompanion, useAvatarCompanion } from "./AvatarCompanion";
import { CelebrationEffect } from "./PageTransition";

interface UserProfile {
  name: string;
  age: number;
  grade: string;
  subjects: string[];
  goals: string[];
  studyStyle: 'visual' | 'auditory' | 'kinesthetic';
}

interface WelcomeOnboardingProps {
  onComplete?: (profile: UserProfile) => void;
  onSkip?: () => void;
}

type OnboardingStep = 'welcome' | 'name' | 'details' | 'subjects' | 'goals' | 'style' | 'celebration';

const subjectOptions = [
  { id: 'math', name: 'Mathematics', icon: '📐', color: 'bg-blue-500' },
  { id: 'science', name: 'Science', icon: '🔬', color: 'bg-green-500' },
  { id: 'english', name: 'English', icon: '📚', color: 'bg-purple-500' },
  { id: 'history', name: 'History', icon: '🏛️', color: 'bg-orange-500' },
  { id: 'spanish', name: 'Spanish', icon: '🇪🇸', color: 'bg-red-500' },
  { id: 'french', name: 'French', icon: '🇫🇷', color: 'bg-pink-500' },
  { id: 'art', name: 'Art', icon: '🎨', color: 'bg-yellow-500' },
  { id: 'music', name: 'Music', icon: '🎵', color: 'bg-indigo-500' }
];

const studyGoals = [
  { id: 'grades', name: 'Improve Grades', icon: '📈', description: 'Get better test scores' },
  { id: 'confidence', name: 'Build Confidence', icon: '💪', description: 'Feel more sure about learning' },
  { id: 'habits', name: 'Study Habits', icon: '⏰', description: 'Create a consistent routine' },
  { id: 'focus', name: 'Better Focus', icon: '🎯', description: 'Concentrate without distractions' },
  { id: 'fun', name: 'Make Learning Fun', icon: '🎉', description: 'Enjoy the learning process' },
  { id: 'friends', name: 'Study with Friends', icon: '👥', description: 'Learn together with peers' }
];

const studyStyles = [
  { 
    id: 'visual', 
    name: 'Visual Learner', 
    icon: '👀', 
    description: 'I learn best with pictures, charts, and colors',
    example: 'Diagrams and mind maps help me understand'
  },
  { 
    id: 'auditory', 
    name: 'Audio Learner', 
    icon: '👂', 
    description: 'I learn best by listening and discussing',
    example: 'I like explanations and talking through problems'
  },
  { 
    id: 'kinesthetic', 
    name: 'Hands-on Learner', 
    icon: '✋', 
    description: 'I learn best by doing and moving',
    example: 'I need to try things myself and stay active'
  }
];

const welcomeFeatures = [
  {
    icon: Brain,
    title: "Smart Study Sessions",
    description: "AI-powered focus time that adapts to your learning style",
    color: "text-blue-500"
  },
  {
    icon: Users,
    title: "Study Together",
    description: "Join virtual study rooms with students from around the world",
    color: "text-green-500"
  },
  {
    icon: Trophy,
    title: "Level Up Learning",
    description: "Earn XP, unlock achievements, and build study streaks",
    color: "text-yellow-500"
  }
];

export function WelcomeOnboarding({ onComplete, onSkip }: WelcomeOnboardingProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: 13,
    grade: '7th Grade',
    subjects: [],
    goals: [],
    studyStyle: 'visual'
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const companion = useAvatarCompanion();

  const steps: OnboardingStep[] = ['welcome', 'name', 'details', 'subjects', 'goals', 'style', 'celebration'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (currentStep === 'celebration') {
      setShowCelebration(true);
      companion.celebrate();
    }
  }, [currentStep, companion]);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
      companion.showEncouragement();
    } else {
      onComplete?.(profile);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const toggleSubject = (subjectId: string) => {
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(s => s !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };

  const toggleGoal = (goalId: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(g => g !== goalId)
        : [...prev.goals, goalId]
    }));
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 100, scale: 0.9 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      x: -100, 
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 400, damping: 25 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 overflow-auto">
      <CelebrationEffect 
        isVisible={showCelebration} 
        onComplete={() => setShowCelebration(false)}
      />
      
      {/* Progress Bar */}
      {currentStep !== 'welcome' && currentStep !== 'celebration' && (
        <motion.div 
          className="max-w-4xl mx-auto mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Getting to know you...</span>
            <span className="text-sm text-gray-600">Step {currentStepIndex} of {steps.length - 2}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Avatar Companion */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="sticky top-6"
            >
              <AvatarCompanion
                mood={companion.mood}
                message={companion.message}
                showMessage={companion.showMessage}
                onInteraction={companion.showEncouragement}
                size="large"
                position="relative"
              />
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                {/* Welcome Step */}
                {currentStep === 'welcome' && (
                  <div className="text-center space-y-8">
                    <motion.div variants={itemVariants}>
                      <motion.div
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="text-8xl mb-4"
                      >
                        🎓
                      </motion.div>
                      <h1 className="text-5xl font-bold font-['Poppins'] bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-4">
                        Welcome to StudySync!
                      </h1>
                      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Your personal AI study companion that makes learning fun, focused, and social! 
                        Let's create your perfect study environment together! ✨
                      </p>
                    </motion.div>

                    <motion.div 
                      variants={itemVariants}
                      className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                    >
                      {welcomeFeatures.map((feature, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          whileHover={{ y: -8, scale: 1.05 }}
                          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                        >
                          <feature.icon className={`w-12 h-12 ${feature.color} mx-auto mb-4`} />
                          <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                          <p className="text-gray-600 text-sm">{feature.description}</p>
                        </motion.div>
                      ))}
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-4">
                      <Button
                        onClick={nextStep}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-4 rounded-xl shadow-lg"
                      >
                        Let's Get Started! 🚀
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                      <div>
                        <Button variant="ghost" onClick={onSkip} className="text-gray-500">
                          Skip for now
                        </Button>
                      </div>
                    </motion.div>
                  </div>
                )}

                {/* Name Step */}
                {currentStep === 'name' && (
                  <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                          <Heart className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>
                      <CardTitle className="text-2xl font-bold">What's your name?</CardTitle>
                      <p className="text-gray-600">Help us personalize your experience!</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <Label htmlFor="name" className="text-lg font-medium">First Name</Label>
                        <Input
                          id="name"
                          placeholder="Enter your first name"
                          value={profile.name}
                          onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-2 text-lg h-12 rounded-xl"
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1 rounded-xl">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button 
                          onClick={nextStep} 
                          disabled={!profile.name.trim()}
                          size="lg" 
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Details Step */}
                {currentStep === 'details' && (
                  <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                          <Star className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>
                      <CardTitle className="text-2xl font-bold">Tell us about yourself!</CardTitle>
                      <p className="text-gray-600">This helps us create the perfect learning experience for you</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="age" className="text-lg font-medium">Age</Label>
                          <Input
                            id="age"
                            type="number"
                            min="8"
                            max="25"
                            value={profile.age}
                            onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 13 }))}
                            className="mt-2 text-lg h-12 rounded-xl"
                          />
                        </div>
                        <div>
                          <Label htmlFor="grade" className="text-lg font-medium">Grade Level</Label>
                          <Input
                            id="grade"
                            placeholder="e.g., 7th Grade, High School"
                            value={profile.grade}
                            onChange={(e) => setProfile(prev => ({ ...prev, grade: e.target.value }))}
                            className="mt-2 text-lg h-12 rounded-xl"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1 rounded-xl">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button onClick={nextStep} size="lg" className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-xl">
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Subjects Step */}
                {currentStep === 'subjects' && (
                  <Card className="max-w-4xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
                          <BookOpen className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>
                      <CardTitle className="text-2xl font-bold">What subjects are you studying?</CardTitle>
                      <p className="text-gray-600">Select all that apply - we'll customize your experience!</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {subjectOptions.map((subject) => {
                          const isSelected = profile.subjects.includes(subject.id);
                          return (
                            <motion.button
                              key={subject.id}
                              onClick={() => toggleSubject(subject.id)}
                              className={`p-4 rounded-xl border-2 text-center transition-all ${
                                isSelected 
                                  ? 'border-purple-400 bg-purple-50 shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <div className="text-2xl mb-2">{subject.icon}</div>
                              <div className="text-sm font-medium">{subject.name}</div>
                            </motion.button>
                          );
                        })}
                      </div>
                      
                      <div className="flex gap-3">
                        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1 rounded-xl">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button onClick={nextStep} size="lg" className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-xl">
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Goals Step */}
                {currentStep === 'goals' && (
                  <Card className="max-w-4xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-pink-500 to-red-500 rounded-full flex items-center justify-center mb-4">
                          <Target className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>
                      <CardTitle className="text-2xl font-bold">What are your study goals?</CardTitle>
                      <p className="text-gray-600">Choose what you'd like to achieve - we'll help you get there!</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        {studyGoals.map((goal) => {
                          const isSelected = profile.goals.includes(goal.id);
                          return (
                            <motion.button
                              key={goal.id}
                              onClick={() => toggleGoal(goal.id)}
                              className={`p-4 rounded-xl border-2 text-left transition-all ${
                                isSelected 
                                  ? 'border-pink-400 bg-pink-50 shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="text-2xl">{goal.icon}</div>
                                <div>
                                  <div className="font-medium">{goal.name}</div>
                                  <div className="text-sm text-gray-600">{goal.description}</div>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                      
                      <div className="flex gap-3">
                        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1 rounded-xl">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button onClick={nextStep} size="lg" className="flex-1 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 rounded-xl">
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Learning Style Step */}
                {currentStep === 'style' && (
                  <Card className="max-w-4xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>
                      <CardTitle className="text-2xl font-bold">How do you learn best?</CardTitle>
                      <p className="text-gray-600">Understanding your learning style helps us create the perfect study experience</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        {studyStyles.map((style) => {
                          const isSelected = profile.studyStyle === style.id;
                          return (
                            <motion.button
                              key={style.id}
                              onClick={() => setProfile(prev => ({ ...prev, studyStyle: style.id as any }))}
                              className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
                                isSelected 
                                  ? 'border-indigo-400 bg-indigo-50 shadow-md' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="flex items-start gap-4">
                                <div className="text-3xl">{style.icon}</div>
                                <div className="flex-1">
                                  <div className="text-lg font-bold mb-1">{style.name}</div>
                                  <div className="text-gray-700 mb-2">{style.description}</div>
                                  <div className="text-sm text-gray-600 italic">"{style.example}"</div>
                                </div>
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-indigo-600"
                                  >
                                    <Sparkles className="w-6 h-6" />
                                  </motion.div>
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                      
                      <div className="flex gap-3">
                        <Button onClick={prevStep} variant="outline" size="lg" className="flex-1 rounded-xl">
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button onClick={nextStep} size="lg" className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl">
                          Complete Setup! 
                          <Gift className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Celebration Step */}
                {currentStep === 'celebration' && (
                  <div className="text-center space-y-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: 360,
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                        }}
                        className="text-8xl mb-6"
                      >
                        🎉
                      </motion.div>
                      <h1 className="text-4xl font-bold font-['Poppins'] bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-4">
                        Welcome to StudySync, {profile.name}!
                      </h1>
                      <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
                        Your personalized learning journey is ready! We've prepared everything based on your preferences.
                      </p>
                    </motion.div>

                    <motion.div 
                      className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-xl border border-purple-200">
                        <div className="text-2xl mb-2">🏆</div>
                        <div className="font-bold text-purple-800">Welcome Bonus</div>
                        <div className="text-sm text-purple-600">+100 XP & First Achievement!</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-4 rounded-xl border border-blue-200">
                        <div className="text-2xl mb-2">⭐</div>
                        <div className="font-bold text-blue-800">Level 1 Unlocked</div>
                        <div className="text-sm text-blue-600">Your learning adventure begins!</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-xl border border-green-200">
                        <div className="text-2xl mb-2">🎯</div>
                        <div className="font-bold text-green-800">Goals Set</div>
                        <div className="text-sm text-green-600">We'll help you achieve them!</div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Button
                        onClick={() => onComplete?.(profile)}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg px-8 py-4 rounded-xl shadow-lg"
                      >
                        Start My Learning Journey! 
                        <Zap className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}