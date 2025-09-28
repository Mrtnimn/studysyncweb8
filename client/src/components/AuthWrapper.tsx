import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, UserPlus, LogIn, Github, Chrome } from "lucide-react";
import { WelcomeOnboarding } from "./WelcomeOnboarding";
import { PageTransition } from "./PageTransition";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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
  name: string; // computed property for compatibility
}

interface AuthWrapperProps {
  children: (user: User) => React.ReactNode;
  onAuthStateChange?: (user: User | null) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'onboarding' | 'authenticated';

export function AuthWrapper({ children, onAuthStateChange }: AuthWrapperProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [user, setUser] = useState<User | null>(null);
  const [credentials, setCredentials] = useState({ username: '', email: '', password: '', display_name: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();

  // Check authentication state on load
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        const user: User = {
          ...userData,
          name: userData.display_name || userData.username
        };
        setUser(user);
        setAuthMode('authenticated');
        onAuthStateChange?.(user);
      }
    } catch (error) {
      // Not authenticated, stay on login screen
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        const user: User = {
          ...userData,
          name: userData.display_name || userData.username
        };
        setUser(user);
        setAuthMode('authenticated');
        onAuthStateChange?.(user);
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your account."
        });
      } else {
        const error = await response.json();
        toast({
          title: "Login failed",
          description: error.message || "Invalid credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!credentials.username || !credentials.password || !credentials.display_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          email: credentials.email || null,
          display_name: credentials.display_name,
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        const user: User = {
          ...userData,
          name: userData.display_name || userData.username
        };
        setUser(user);
        setAuthMode('onboarding');
        onAuthStateChange?.(user);
        toast({
          title: "Account created!",
          description: "Welcome to StudySync! Let's get you set up."
        });
      } else {
        const error = await response.json();
        toast({
          title: "Signup failed",
          description: error.message || "Could not create account",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = (profile: any) => {
    if (user) {
      const updatedUser = { ...user, profile };
      setUser(updatedUser);
      setAuthMode('authenticated');
      onAuthStateChange?.(updatedUser);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // Redirect to OAuth endpoint
    window.location.href = `/api/auth/${provider}`;
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      });
      setUser(null);
      setAuthMode('login');
      onAuthStateChange?.(null);
      toast({
        title: "Logged out",
        description: "You've been successfully logged out."
      });
    } catch (error) {
      // Silent fail - just clear local state
      setUser(null);
      setAuthMode('login');
      onAuthStateChange?.(null);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({ email: resetEmail })
      });

      if (response.ok) {
        toast({
          title: "Reset Email Sent",
          description: "If an account exists with that email, a reset link will be sent.",
          variant: "default"
        });
        
        setAuthMode('login');
        setResetEmail('');
      } else {
        const error = await response.json();
        toast({
          title: "Failed to Send",
          description: error.message || "Failed to send reset email. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken || !newPassword) {
      toast({
        title: "Error", 
        description: "Please enter both token and new password",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify({ token: resetToken, password: newPassword })
      });

      if (response.ok) {
        toast({
          title: "Password Reset",
          description: "Your password has been reset successfully. Please log in.",
          variant: "default"
        });
        
        setAuthMode('login');
        setResetToken('');
        setNewPassword('');
      } else {
        const error = await response.json();
        toast({
          title: "Reset Failed",
          description: error.message || "Failed to reset password. The token may be expired.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If authenticated, render the main app
  if (authMode === 'authenticated' && user) {
    return <>{children(user)}</>;
  }

  // If in onboarding mode, show the onboarding flow
  if (authMode === 'onboarding') {
    return (
      <WelcomeOnboarding
        onComplete={handleOnboardingComplete}
        onSkip={() => setAuthMode('authenticated')}
      />
    );
  }

  // Show login/signup forms
  return (
    <PageTransition className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
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
            className="text-6xl mb-4"
          >
            🎓
          </motion.div>
          <h1 className="text-4xl font-bold font-['Poppins'] bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent mb-2">
            StudySync
          </h1>
          <p className="text-gray-600">
            Your AI-powered study companion for focused learning
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              {authMode === 'login' ? 'Welcome Back!' : 'Join StudySync!'}
            </CardTitle>
            <p className="text-gray-600 text-sm">
              {authMode === 'login' 
                ? 'Sign in to continue your learning journey'
                : 'Start your personalized learning adventure'
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Social Login Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 text-left justify-start gap-3 hover:bg-blue-50 hover:border-blue-200"
              >
                <Chrome className="w-5 h-5 text-blue-600" />
                <span>Continue with Google</span>
              </Button>
              
              <Button
                onClick={() => handleSocialLogin('github')}
                disabled={isLoading}
                variant="outline"
                className="w-full h-12 text-left justify-start gap-3 hover:bg-gray-50 hover:border-gray-300"
              >
                <Github className="w-5 h-5 text-gray-700" />
                <span>Continue with GitHub</span>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with email</span>
              </div>
            </div>

            {/* Credential Form - show only for login/signup modes */}
            {(authMode === 'login' || authMode === 'signup') && (
            <div className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <Label htmlFor="display_name">Full Name</Label>
                  <Input
                    id="display_name"
                    placeholder="Enter your full name"
                    value={credentials.display_name}
                    onChange={(e) => setCredentials(prev => ({ ...prev, display_name: e.target.value }))}
                    className="mt-1 h-11"
                    data-testid="input-display-name"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    className="pl-10 mt-1 h-11"
                    data-testid="input-username"
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div>
                  <Label htmlFor="email">Email (optional)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={credentials.email}
                      onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 mt-1 h-11"
                      data-testid="input-email"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10 mt-1 h-11"
                  />
                </div>
              </div>
            </div>
            )}

            {/* Submit Button - show only for login/signup modes */}
            {(authMode === 'login' || authMode === 'signup') && (
            <>
            <Button
              onClick={authMode === 'login' ? handleLogin : handleSignup}
              disabled={isLoading || !credentials.username || !credentials.password || (authMode === 'signup' && !credentials.display_name)}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              data-testid="button-submit"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                <>
                  {authMode === 'login' ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                  {authMode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </Button>

            {/* Toggle Mode */}
            <div className="text-center">
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setCredentials({ username: '', email: '', password: '', display_name: '' });
                }}
                disabled={isLoading}
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                data-testid="button-toggle-mode"
              >
                {authMode === 'login' 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
              
              {/* Forgot Password Link */}
              {authMode === 'login' && (
                <div className="mt-2">
                  <button
                    onClick={() => setAuthMode('forgot-password')}
                    disabled={isLoading}
                    className="text-xs text-gray-500 hover:text-purple-600 transition-colors"
                    data-testid="button-forgot-password"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </div>
            </>
            )}

            {/* Forgot Password Form */}
            {authMode === 'forgot-password' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10 mt-1 h-11"
                      data-testid="input-reset-email"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleForgotPassword}
                  disabled={isLoading || !resetEmail}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  data-testid="button-send-reset"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>
                
                <div className="text-center">
                  <button
                    onClick={() => setAuthMode('login')}
                    disabled={isLoading}
                    className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
                    data-testid="button-back-to-login"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}

            {/* Reset Password Form */}
            {authMode === 'reset-password' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 mt-1 h-11"
                      data-testid="input-new-password"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleResetPassword}
                  disabled={isLoading || !newPassword || newPassword.length < 6}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  data-testid="button-confirm-reset"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Demo Mode */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">For demo purposes</p>
              <Button
                onClick={() => {
                  const demoUser: User = {
                    id: 'demo',
                    username: 'demo',
                    email: 'demo@studysync.com',
                    display_name: 'Alex Johnson',
                    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                    study_level: 5,
                    total_xp: 1250,
                    study_streak: 7,
                    longest_streak: 15,
                    name: 'Alex Johnson'
                  };
                  setUser(demoUser);
                  setAuthMode('authenticated');
                  onAuthStateChange?.(demoUser);
                  toast({
                    title: "Demo Mode",
                    description: "You're using demo mode with sample data."
                  });
                }}
                variant="outline"
                size="sm"
                className="text-xs"
                data-testid="button-demo"
              >
                Continue as Demo User
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageTransition>
  );
}