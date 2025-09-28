import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import session from "express-session";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import nodemailer from "nodemailer";
import crypto from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertUserSchema, insertStudySessionSchema, insertCalendarEventSchema, insertAchievementSchema, insertTutorProfileSchema, insertTutorBookingSchema, insertTutorReviewSchema } from "@shared/schema";
import { z } from "zod";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

// Session configuration
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// Create PostgreSQL session store for production persistence
const PgSession = connectPgSimple(session);

// Enhanced session security configuration
const sessionSecret = process.env.SESSION_SECRET;

// Enforce strong session secret in production
if (process.env.NODE_ENV === 'production' && (!sessionSecret || sessionSecret.length < 32)) {
  console.error('SECURITY ERROR: SESSION_SECRET must be set and at least 32 characters long in production');
  process.exit(1);
}

const sessionConfig = {
  secret: sessionSecret || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'studysync.sid', // Custom session name for security
  // Use PostgreSQL session store for production persistence in serverless environments
  store: new PgSession({
    pool: pool,
    tableName: 'session',
    createTableIfMissing: true,
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const, // CSRF protection
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

// Email transporter for password reset
const emailTransporter = nodemailer.createTransport({
  service: 'gmail', // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER || 'noreply@studysync.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Passport configuration
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Check if user already exists
      let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (!user) {
        // Create new user
        const userData = {
          username: profile.username || profile.displayName || `user_${profile.id}`,
          password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10), // Random password for OAuth users
          email: profile.emails?.[0]?.value || null,
          display_name: profile.displayName,
          avatar_url: profile.photos?.[0]?.value || null
        };
        user = await storage.createUser(userData);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }));
}

// GitHub OAuth Strategy  
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "/api/auth/github/callback"
  }, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Check if user already exists
      let user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
      
      if (!user) {
        // Create new user
        const userData = {
          username: profile.username || profile.displayName || `user_${profile.id}`,
          password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10), // Random password for OAuth users
          email: profile.emails?.[0]?.value || null,
          display_name: profile.displayName,
          avatar_url: profile.photos?.[0]?.value || null
        };
        user = await storage.createUser(userData);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, undefined);
    }
  }));
}

// Password reset token storage (in production, use Redis or database)
const passwordResetTokens = new Map<string, { userId: string, expires: Date }>();

// File upload configuration
const uploadDir = path.join(process.cwd(), 'uploads');
const avatarDir = path.join(uploadDir, 'avatars');
const documentsDir = path.join(uploadDir, 'documents');

// Ensure upload directories exist
[uploadDir, avatarDir, documentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer configuration for avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP are allowed.'));
    }
  }
});

// Multer configuration for documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `doc-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for documents
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and images are allowed.'));
    }
  }
});

// Achievement checking and unlock system
async function checkAndUnlockAchievements(userId: string, actionType: string, actionData: any = {}) {
  try {
    const user = await storage.getUser(userId);
    if (!user) return [];

    const allAchievements = await storage.getAllAchievements();
    const userAchievements = await storage.getUserAchievements(userId);
    const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id));
    
    const newlyUnlocked = [];

    for (const achievement of allAchievements) {
      // Skip if already unlocked
      if (unlockedAchievementIds.has(achievement.id)) continue;

      const criteria = achievement.unlock_criteria as any;
      let shouldUnlock = false;

      switch (criteria.type) {
        case 'sessions_completed':
          if (actionType === 'session_completed') {
            const sessions = await storage.getUserStudySessions(userId);
            shouldUnlock = sessions.length >= criteria.target;
          }
          break;

        case 'study_streak':
          if (actionType === 'session_completed' || actionType === 'streak_updated') {
            shouldUnlock = (user.study_streak || 0) >= criteria.target;
          }
          break;

        case 'total_xp':
          if (actionType === 'xp_gained') {
            shouldUnlock = (user.total_xp || 0) >= criteria.target;
          }
          break;

        case 'session_duration':
          if (actionType === 'session_completed' && actionData.duration_minutes) {
            shouldUnlock = actionData.duration_minutes >= criteria.target;
          }
          break;

        case 'early_study':
          if (actionType === 'session_completed' && actionData.start_time) {
            const startHour = new Date(actionData.start_time).getHours();
            shouldUnlock = startHour < 7;
          }
          break;

        case 'group_sessions':
          if (actionType === 'group_session_joined') {
            // For this, we'd need to track group session participation
            // For now, we'll implement a basic version
            shouldUnlock = actionData.groupSessionCount >= criteria.target;
          }
          break;

        case 'consecutive_days':
          if (actionType === 'session_completed') {
            // Check if user has studied for consecutive days
            shouldUnlock = (user.study_streak || 0) >= criteria.target;
          }
          break;
      }

      if (shouldUnlock) {
        try {
          const unlockedAchievement = await storage.unlockAchievement(userId, achievement.id);
          
          // Award XP for achievement
          if (achievement.xp_reward && achievement.xp_reward > 0) {
            await storage.updateUserXP(userId, achievement.xp_reward);
          }

          newlyUnlocked.push({
            achievement,
            unlockedAt: unlockedAchievement.unlocked_at
          });
        } catch (error) {
          console.log('Achievement already unlocked or error:', achievement.name);
        }
      }
    }

    return newlyUnlocked;
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
  }
}

// Seed initial achievements
async function seedAchievements() {
  const existingAchievements = await storage.getAllAchievements();
  if (existingAchievements.length === 0) {
    // Create initial achievements
    const achievements = [
      {
        name: "First Steps",
        description: "Complete your first study session",
        icon: "target",
        xp_reward: 50,
        badge_color: "blue",
        category: "milestone",
        unlock_criteria: { type: "sessions_completed", target: 1 }
      },
      {
        name: "Week Warrior",
        description: "Study for 7 days in a row",
        icon: "flame",
        xp_reward: 200,
        badge_color: "orange",
        category: "streak",
        unlock_criteria: { type: "study_streak", target: 7 }
      },
      {
        name: "Early Bird",
        description: "Start a study session before 7 AM",
        icon: "sunrise",
        xp_reward: 100,
        badge_color: "yellow",
        category: "focus",
        unlock_criteria: { type: "early_study", target: 1 }
      },
      {
        name: "XP Master",
        description: "Earn 1000 total XP points",
        icon: "star",
        xp_reward: 300,
        badge_color: "purple",
        category: "xp",
        unlock_criteria: { type: "total_xp", target: 1000 }
      },
      {
        name: "Study Marathon",
        description: "Study for 2 hours in a single session",
        icon: "clock",
        xp_reward: 150,
        badge_color: "green",
        category: "focus",
        unlock_criteria: { type: "session_duration", target: 120 }
      }
    ];

    for (const achievement of achievements) {
      try {
        const validatedAchievement = insertAchievementSchema.parse(achievement);
        await storage.createAchievement(validatedAchievement);
      } catch (error) {
        console.log('Could not seed achievement:', achievement.name);
      }
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Security settings for production
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // Trust first proxy (required for secure cookies behind proxies)
  }

  app.use(session(sessionConfig));
  
  // Security headers middleware
  app.use((req, res, next) => {
    // Content Security Policy for iframe security
    res.setHeader('Content-Security-Policy', [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "media-src 'self' blob:",
      "frame-src https://www.youtube-nocookie.com https://open.spotify.com",
      "connect-src 'self' https://api.dictionaryapi.dev",
      "upgrade-insecure-requests"
    ].join('; '));

    // Additional security headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    next();
  });

  // CSRF protection via custom header for state-changing routes
  const requireCSRFProtection = (req: any, res: any, next: any) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const csrfHeader = req.get('X-Requested-With');
      if (csrfHeader !== 'XMLHttpRequest') {
        return res.status(403).json({ message: 'CSRF protection: missing required header' });
      }
    }
    next();
  };
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Seed achievements on startup
  await seedAchievements();

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Set session
      req.session.userId = user.id;
      
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        study_level: user.study_level,
        total_xp: user.total_xp,
        study_streak: user.study_streak,
        longest_streak: user.longest_streak
      });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid input' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = z.object({
        username: z.string(),
        password: z.string()
      }).parse(req.body);

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Set session
      req.session.userId = user.id;

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        study_level: user.study_level,
        total_xp: user.total_xp,
        study_streak: user.study_streak,
        longest_streak: user.longest_streak
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid input' });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        study_level: user.study_level,
        total_xp: user.total_xp,
        study_streak: user.study_streak,
        longest_streak: user.longest_streak,
        last_study_date: user.last_study_date
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Could not log out' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // OAuth Routes
  
  // Google OAuth
  app.get('/api/auth/google', 
    passport.authenticate('google', { 
      scope: ['profile', 'email'],
      state: crypto.randomBytes(32).toString('hex') // CSRF protection
    })
  );

  app.get('/api/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Set session for our custom auth middleware
      if (req.user && (req.user as any).id) {
        req.session.userId = (req.user as any).id;
      }
      // Successful authentication, redirect to dashboard
      res.redirect('/dashboard');
    }
  );

  // GitHub OAuth
  app.get('/api/auth/github',
    passport.authenticate('github', { 
      scope: ['user:email'],
      state: crypto.randomBytes(32).toString('hex') // CSRF protection
    })
  );

  app.get('/api/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    (req, res) => {
      // Set session for our custom auth middleware
      if (req.user && (req.user as any).id) {
        req.session.userId = (req.user as any).id;
      }
      // Successful authentication, redirect to dashboard
      res.redirect('/dashboard');
    }
  );

  // File Upload Routes
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));

  // Avatar upload route
  app.post('/api/upload/avatar', requireAuth, avatarUpload.single('avatar'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      
      // Update user avatar in database
      await storage.updateUserAvatar(req.session.userId!, avatarUrl);

      res.json({
        message: 'Avatar uploaded successfully',
        avatarUrl: avatarUrl,
        filename: req.file.filename
      });
    } catch (error) {
      // Clean up uploaded file if database update fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'Failed to upload avatar' });
    }
  });

  // Document upload route
  app.post('/api/upload/document', requireAuth, documentUpload.single('document'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const documentUrl = `/uploads/documents/${req.file.filename}`;

      res.json({
        message: 'Document uploaded successfully',
        documentUrl: documentUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'Failed to upload document' });
    }
  });

  // Delete uploaded file route
  app.delete('/api/upload/:type/:filename', requireAuth, async (req, res) => {
    try {
      const { type, filename } = req.params;
      const allowedTypes = ['avatars', 'documents'];
      
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({ message: 'Invalid file type' });
      }

      const filePath = path.join(uploadDir, type, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ message: 'File deleted successfully' });
      } else {
        res.status(404).json({ message: 'File not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete file' });
    }
  });

  // Password Reset Routes
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = z.object({ email: z.string().email() }).parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ message: 'If an account exists with that email, a reset link will be sent.' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Store token (in production, use database or Redis)
      passwordResetTokens.set(resetToken, { userId: user.id, expires });

      // Send email (if configured)
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        try {
          await emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'StudySync Password Reset',
            html: `
              <h2>Password Reset Request</h2>
              <p>Click the link below to reset your password:</p>
              <a href="${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}">Reset Password</a>
              <p>This link expires in 1 hour.</p>
              <p>If you didn't request this, please ignore this email.</p>
            `
          });
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
        }
      }

      res.json({ message: 'If an account exists with that email, a reset link will be sent.' });
    } catch (error) {
      res.status(400).json({ message: 'Invalid email address' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = z.object({
        token: z.string(),
        password: z.string().min(6)
      }).parse(req.body);

      const resetData = passwordResetTokens.get(token);
      if (!resetData || resetData.expires < new Date()) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
      }

      // Update password
      const hashedPassword = await bcrypt.hash(password, 10);
      await storage.updateUserPassword(resetData.userId, hashedPassword);

      // Remove used token
      passwordResetTokens.delete(token);

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Invalid request' });
    }
  });

  // Study sessions routes
  app.post('/api/sessions', requireAuth, async (req, res) => {
    try {
      const sessionData = insertStudySessionSchema.parse(req.body);
      const session = await storage.createStudySession(req.session.userId!, sessionData);
      
      // Update user XP and streak
      const xpGained = Math.floor(sessionData.duration_minutes * 2); // 2 XP per minute
      await storage.updateUserXP(req.session.userId!, xpGained);
      
      // Simple streak logic - increment if studied today
      const user = await storage.getUser(req.session.userId!);
      if (user) {
        const today = new Date();
        const lastStudy = user.last_study_date ? new Date(user.last_study_date) : null;
        const isToday = lastStudy && 
          today.toDateString() === lastStudy.toDateString();
        
        if (!isToday) {
          await storage.updateUserStreak(req.session.userId!, (user.study_streak || 0) + 1);
        }
      }

      // Check for achievements
      const newAchievements = await checkAndUnlockAchievements(req.session.userId!, 'session_completed', {
        duration_minutes: sessionData.duration_minutes,
        start_time: new Date(),
        session_type: sessionData.session_type
      });

      // Also check for XP-based achievements
      const xpAchievements = await checkAndUnlockAchievements(req.session.userId!, 'xp_gained');

      // Combine all new achievements
      const allNewAchievements = [...newAchievements, ...xpAchievements];

      res.json({
        session,
        newAchievements: allNewAchievements
      });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid input' });
    }
  });

  app.get('/api/sessions/me', requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const sessions = await storage.getUserStudySessions(req.session.userId!, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Calendar events routes
  app.get('/api/events', requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;
      
      const events = await storage.getUserCalendarEvents(req.session.userId!, start, end);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/events', requireAuth, async (req, res) => {
    try {
      const eventData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(req.session.userId!, eventData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid input' });
    }
  });

  app.patch('/api/events/:id', requireAuth, async (req, res) => {
    try {
      const eventId = req.params.id;
      const updates = req.body;
      await storage.updateCalendarEvent(eventId, updates);
      res.json({ message: 'Event updated' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Achievements routes
  app.get('/api/achievements', requireAuth, async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/achievements/me', requireAuth, async (req, res) => {
    try {
      const userAchievements = await storage.getUserAchievements(req.session.userId!);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Trigger manual achievement check
  app.post('/api/achievements/check', requireAuth, async (req, res) => {
    try {
      const { actionType, actionData } = req.body;
      const newAchievements = await checkAndUnlockAchievements(
        req.session.userId!, 
        actionType || 'manual_check', 
        actionData || {}
      );
      
      res.json({
        message: 'Achievement check completed',
        newAchievements
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Group study rooms routes
  app.get('/api/rooms', async (req, res) => {
    try {
      const rooms = await storage.getActiveGroupRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/rooms', requireAuth, async (req, res) => {
    try {
      const roomData = req.body;
      const room = await storage.createGroupRoom(req.session.userId!, roomData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid input' });
    }
  });

  app.post('/api/rooms/:id/join', requireAuth, async (req, res) => {
    try {
      const roomId = req.params.id;
      await storage.joinRoom(roomId, req.session.userId!);
      res.json({ message: 'Joined room successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Could not join room' });
    }
  });

  // Tutor Profile routes
  app.post('/api/tutors/profile', requireAuth, async (req, res) => {
    try {
      const profileData = insertTutorProfileSchema.parse(req.body);
      const profile = await storage.createTutorProfile(req.session.userId!, profileData);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid tutor profile data' });
    }
  });

  app.get('/api/tutors/profile/me', requireAuth, async (req, res) => {
    try {
      const profile = await storage.getTutorProfile(req.session.userId!);
      res.json(profile || null);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/tutors/profile/:id', async (req, res) => {
    try {
      const profile = await storage.getTutorProfileById(req.params.id);
      if (!profile) {
        return res.status(404).json({ message: 'Tutor profile not found' });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.patch('/api/tutors/profile', requireAuth, async (req, res) => {
    try {
      const profile = await storage.getTutorProfile(req.session.userId!);
      if (!profile) {
        return res.status(404).json({ message: 'Tutor profile not found' });
      }
      
      await storage.updateTutorProfile(profile.id, req.body);
      res.json({ message: 'Profile updated successfully' });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid update data' });
    }
  });

  // Tutor Search and Browse routes
  app.get('/api/tutors/search', async (req, res) => {
    try {
      const { subject, minRating, maxRate } = req.query;
      const filters = {
        subject: subject as string,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        maxRate: maxRate ? parseFloat(maxRate as string) : undefined
      };
      
      const tutors = await storage.searchTutors(filters);
      res.json(tutors);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Tutor Booking routes
  app.post('/api/tutors/bookings', requireAuth, async (req, res) => {
    try {
      const bookingData = insertTutorBookingSchema.parse(req.body);
      const booking = await storage.createTutorBooking(req.session.userId!, bookingData);
      res.json(booking);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid booking data' });
    }
  });

  app.get('/api/tutors/bookings/student', requireAuth, async (req, res) => {
    try {
      const bookings = await storage.getStudentBookings(req.session.userId!);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/tutors/bookings/tutor', requireAuth, async (req, res) => {
    try {
      const profile = await storage.getTutorProfile(req.session.userId!);
      if (!profile) {
        return res.status(404).json({ message: 'Tutor profile not found' });
      }
      
      const bookings = await storage.getTutorBookings(profile.id);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.patch('/api/tutors/bookings/:id/status', requireAuth, async (req, res) => {
    try {
      const { status } = z.object({ status: z.string() }).parse(req.body);
      await storage.updateBookingStatus(req.params.id, status);
      res.json({ message: 'Booking status updated successfully' });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid status update' });
    }
  });

  // Tutor Review routes
  app.post('/api/tutors/reviews', requireAuth, async (req, res) => {
    try {
      const reviewData = insertTutorReviewSchema.parse(req.body);
      const review = await storage.createTutorReview(req.session.userId!, reviewData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid review data' });
    }
  });

  app.get('/api/tutors/:id/reviews', async (req, res) => {
    try {
      const reviews = await storage.getTutorReviews(req.params.id);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize Socket.IO for real-time features
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5000'],
      credentials: true
    }
  });

  // Socket.IO middleware for authentication
  io.use(async (socket, next) => {
    try {
      const sessionId = socket.handshake.headers.sessionid;
      if (!sessionId) {
        return next(new Error('Authentication required'));
      }
      
      // Here we would validate the session, for now we'll allow all
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  // Store active study room participants
  const activeRooms = new Map<string, Set<string>>();
  const userRoomMapping = new Map<string, string>();

  // Handle WebSocket connections
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join study room
    socket.on('join-room', async (data) => {
      try {
        const { roomId, userId, userName } = data;
        
        // Leave previous room if any
        const previousRoom = userRoomMapping.get(socket.id);
        if (previousRoom) {
          socket.leave(previousRoom);
          const roomParticipants = activeRooms.get(previousRoom);
          if (roomParticipants) {
            roomParticipants.delete(socket.id);
            socket.to(previousRoom).emit('user-left', {
              userId: socket.id,
              participantCount: roomParticipants.size
            });
          }
        }

        // Join new room
        socket.join(roomId);
        userRoomMapping.set(socket.id, roomId);
        
        if (!activeRooms.has(roomId)) {
          activeRooms.set(roomId, new Set());
        }
        activeRooms.get(roomId)!.add(socket.id);

        // Notify room of new participant
        socket.to(roomId).emit('user-joined', {
          userId: socket.id,
          userName: userName,
          participantCount: activeRooms.get(roomId)!.size
        });

        // Send current participant list to new user
        socket.emit('room-joined', {
          roomId,
          participantCount: activeRooms.get(roomId)!.size,
          participants: Array.from(activeRooms.get(roomId)!)
        });

        console.log(`User ${userId} joined room ${roomId}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle chat messages
    socket.on('chat-message', (data) => {
      const { roomId, message, userId, userName, timestamp } = data;
      
      // Broadcast message to room participants
      socket.to(roomId).emit('chat-message', {
        id: crypto.randomUUID(),
        message,
        userId,
        userName,
        timestamp: timestamp || new Date().toISOString()
      });
    });

    // Handle WebRTC signaling for video/audio
    socket.on('webrtc-offer', (data) => {
      const { roomId, offer, targetUserId } = data;
      socket.to(targetUserId).emit('webrtc-offer', {
        offer,
        fromUserId: socket.id
      });
    });

    socket.on('webrtc-answer', (data) => {
      const { answer, targetUserId } = data;
      socket.to(targetUserId).emit('webrtc-answer', {
        answer,
        fromUserId: socket.id
      });
    });

    socket.on('webrtc-ice-candidate', (data) => {
      const { candidate, targetUserId } = data;
      socket.to(targetUserId).emit('webrtc-ice-candidate', {
        candidate,
        fromUserId: socket.id
      });
    });

    // Handle shared document updates
    socket.on('document-update', (data) => {
      const { roomId, documentId, content, userId } = data;
      socket.to(roomId).emit('document-update', {
        documentId,
        content,
        userId,
        timestamp: new Date().toISOString()
      });
    });

    // Handle cursor/selection sharing
    socket.on('cursor-update', (data) => {
      const { roomId, position, selection, userId } = data;
      socket.to(roomId).emit('cursor-update', {
        position,
        selection,
        userId
      });
    });

    // Handle screen sharing
    socket.on('screen-share-start', (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit('screen-share-start', {
        userId,
        socketId: socket.id
      });
    });

    socket.on('screen-share-stop', (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit('screen-share-stop', {
        userId,
        socketId: socket.id
      });
    });

    // Handle drawing/whiteboard updates
    socket.on('whiteboard-update', (data) => {
      const { roomId, drawingData, userId } = data;
      socket.to(roomId).emit('whiteboard-update', {
        drawingData,
        userId,
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      const roomId = userRoomMapping.get(socket.id);
      if (roomId) {
        const roomParticipants = activeRooms.get(roomId);
        if (roomParticipants) {
          roomParticipants.delete(socket.id);
          socket.to(roomId).emit('user-left', {
            userId: socket.id,
            participantCount: roomParticipants.size
          });
          
          // Clean up empty rooms
          if (roomParticipants.size === 0) {
            activeRooms.delete(roomId);
          }
        }
        userRoomMapping.delete(socket.id);
      }
    });

    // Handle leaving room explicitly
    socket.on('leave-room', () => {
      const roomId = userRoomMapping.get(socket.id);
      if (roomId) {
        socket.leave(roomId);
        const roomParticipants = activeRooms.get(roomId);
        if (roomParticipants) {
          roomParticipants.delete(socket.id);
          socket.to(roomId).emit('user-left', {
            userId: socket.id,
            participantCount: roomParticipants.size
          });
        }
        userRoomMapping.delete(socket.id);
      }
    });
  });

  return httpServer;
}
