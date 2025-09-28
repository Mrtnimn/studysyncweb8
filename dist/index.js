var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import session from "express-session";
import bcrypt from "bcrypt";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  achievements: () => achievements,
  achievementsRelations: () => achievementsRelations,
  calendarEvents: () => calendarEvents,
  calendarEventsRelations: () => calendarEventsRelations,
  groupStudyRooms: () => groupStudyRooms,
  groupStudyRoomsRelations: () => groupStudyRoomsRelations,
  insertAchievementSchema: () => insertAchievementSchema,
  insertCalendarEventSchema: () => insertCalendarEventSchema,
  insertStudySessionSchema: () => insertStudySessionSchema,
  insertUserSchema: () => insertUserSchema,
  roomParticipants: () => roomParticipants,
  roomParticipantsRelations: () => roomParticipantsRelations,
  studySessions: () => studySessions,
  studySessionsRelations: () => studySessionsRelations,
  userAchievements: () => userAchievements,
  userAchievementsRelations: () => userAchievementsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  avatar_url: text("avatar_url"),
  display_name: text("display_name"),
  study_level: integer("study_level").default(1),
  total_xp: integer("total_xp").default(0),
  study_streak: integer("study_streak").default(0),
  longest_streak: integer("longest_streak").default(0),
  last_study_date: timestamp("last_study_date"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow()
});
var studySessions = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  duration_minutes: integer("duration_minutes").notNull(),
  xp_earned: integer("xp_earned").default(0),
  session_type: text("session_type").notNull(),
  // 'solo' | 'group' | 'tutoring'
  focus_score: integer("focus_score"),
  // 1-100 rating
  notes: text("notes"),
  completed_at: timestamp("completed_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow()
});
var achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xp_reward: integer("xp_reward").default(0),
  badge_color: text("badge_color").default("blue"),
  category: text("category").notNull(),
  // 'streak' | 'xp' | 'social' | 'focus'
  unlock_criteria: jsonb("unlock_criteria").notNull(),
  // JSON criteria for unlocking
  created_at: timestamp("created_at").defaultNow()
});
var userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  achievement_id: varchar("achievement_id").notNull().references(() => achievements.id),
  unlocked_at: timestamp("unlocked_at").defaultNow(),
  is_featured: boolean("is_featured").default(false)
});
var calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time").notNull(),
  session_type: text("session_type").notNull(),
  status: text("status").default("scheduled"),
  // 'scheduled' | 'completed' | 'cancelled'
  reminder_minutes: integer("reminder_minutes").default(15),
  created_at: timestamp("created_at").defaultNow()
});
var groupStudyRooms = pgTable("group_study_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  host_user_id: varchar("host_user_id").notNull().references(() => users.id),
  max_participants: integer("max_participants").default(8),
  current_participants: integer("current_participants").default(0),
  is_active: boolean("is_active").default(true),
  level_requirement: text("level_requirement").default("Beginner"),
  created_at: timestamp("created_at").defaultNow()
});
var roomParticipants = pgTable("room_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  room_id: varchar("room_id").notNull().references(() => groupStudyRooms.id),
  user_id: varchar("user_id").notNull().references(() => users.id),
  joined_at: timestamp("joined_at").defaultNow(),
  left_at: timestamp("left_at"),
  is_active: boolean("is_active").default(true)
});
var usersRelations = relations(users, ({ many }) => ({
  studySessions: many(studySessions),
  userAchievements: many(userAchievements),
  calendarEvents: many(calendarEvents),
  hostedRooms: many(groupStudyRooms),
  roomParticipations: many(roomParticipants)
}));
var studySessionsRelations = relations(studySessions, ({ one }) => ({
  user: one(users, {
    fields: [studySessions.user_id],
    references: [users.id]
  })
}));
var achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements)
}));
var userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.user_id],
    references: [users.id]
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievement_id],
    references: [achievements.id]
  })
}));
var calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  user: one(users, {
    fields: [calendarEvents.user_id],
    references: [users.id]
  })
}));
var groupStudyRoomsRelations = relations(groupStudyRooms, ({ one, many }) => ({
  host: one(users, {
    fields: [groupStudyRooms.host_user_id],
    references: [users.id]
  }),
  participants: many(roomParticipants)
}));
var roomParticipantsRelations = relations(roomParticipants, ({ one }) => ({
  room: one(groupStudyRooms, {
    fields: [roomParticipants.room_id],
    references: [groupStudyRooms.id]
  }),
  user: one(users, {
    fields: [roomParticipants.user_id],
    references: [users.id]
  })
}));
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  display_name: true
});
var insertStudySessionSchema = createInsertSchema(studySessions).pick({
  subject: true,
  duration_minutes: true,
  session_type: true,
  focus_score: true,
  notes: true
});
var insertCalendarEventSchema = createInsertSchema(calendarEvents).pick({
  title: true,
  subject: true,
  start_time: true,
  end_time: true,
  session_type: true,
  reminder_minutes: true
});
var insertAchievementSchema = createInsertSchema(achievements).pick({
  name: true,
  description: true,
  icon: true,
  xp_reward: true,
  badge_color: true,
  category: true,
  unlock_criteria: true
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
  // Disable SSL for local Replit database
});
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, and, sql as sql2, gte, lte, count } from "drizzle-orm";
var DatabaseStorage = class {
  // Users
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUserXP(userId, xpGained) {
    await db.update(users).set({
      total_xp: sql2`${users.total_xp} + ${xpGained}`,
      updated_at: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  async updateUserStreak(userId, streak) {
    await db.update(users).set({
      study_streak: streak,
      longest_streak: sql2`GREATEST(${users.longest_streak}, ${streak})`,
      last_study_date: /* @__PURE__ */ new Date(),
      updated_at: /* @__PURE__ */ new Date()
    }).where(eq(users.id, userId));
  }
  // Study Sessions
  async createStudySession(userId, session2) {
    const [newSession] = await db.insert(studySessions).values({ ...session2, user_id: userId }).returning();
    return newSession;
  }
  async getUserStudySessions(userId, limit = 10) {
    return await db.select().from(studySessions).where(eq(studySessions.user_id, userId)).orderBy(desc(studySessions.completed_at)).limit(limit);
  }
  // Achievements
  async getAllAchievements() {
    return await db.select().from(achievements);
  }
  async createAchievement(achievement) {
    const [newAchievement] = await db.insert(achievements).values([achievement]).returning();
    return newAchievement;
  }
  async getUserAchievements(userId) {
    const result = await db.select({
      id: userAchievements.id,
      user_id: userAchievements.user_id,
      achievement_id: userAchievements.achievement_id,
      unlocked_at: userAchievements.unlocked_at,
      is_featured: userAchievements.is_featured,
      achievement: achievements
    }).from(userAchievements).leftJoin(achievements, eq(userAchievements.achievement_id, achievements.id)).where(eq(userAchievements.user_id, userId)).orderBy(desc(userAchievements.unlocked_at));
    return result.map((row) => ({
      ...row,
      achievement: row.achievement
    }));
  }
  async unlockAchievement(userId, achievementId) {
    const [newAchievement] = await db.insert(userAchievements).values({ user_id: userId, achievement_id: achievementId }).returning();
    return newAchievement;
  }
  // Calendar Events
  async createCalendarEvent(userId, event) {
    const [newEvent] = await db.insert(calendarEvents).values({ ...event, user_id: userId }).returning();
    return newEvent;
  }
  async getUserCalendarEvents(userId, startDate, endDate) {
    let conditions = [eq(calendarEvents.user_id, userId)];
    if (startDate && endDate) {
      conditions.push(
        gte(calendarEvents.start_time, startDate),
        lte(calendarEvents.end_time, endDate)
      );
    }
    return await db.select().from(calendarEvents).where(and(...conditions)).orderBy(calendarEvents.start_time);
  }
  async updateCalendarEvent(eventId, updates) {
    await db.update(calendarEvents).set(updates).where(eq(calendarEvents.id, eventId));
  }
  // Group Study Rooms
  async getActiveGroupRooms() {
    return await db.select().from(groupStudyRooms).where(eq(groupStudyRooms.is_active, true)).orderBy(desc(groupStudyRooms.created_at));
  }
  async createGroupRoom(hostUserId, roomData) {
    const [newRoom] = await db.insert(groupStudyRooms).values({
      name: roomData.name || "New Study Room",
      subject: roomData.subject || "General",
      description: roomData.description,
      host_user_id: hostUserId,
      max_participants: roomData.max_participants || 8,
      level_requirement: roomData.level_requirement || "Beginner"
    }).returning();
    return newRoom;
  }
  async joinRoom(roomId, userId) {
    await db.insert(roomParticipants).values({ room_id: roomId, user_id: userId });
    const participantCount = await db.select({ count: count() }).from(roomParticipants).where(and(
      eq(roomParticipants.room_id, roomId),
      eq(roomParticipants.is_active, true)
    ));
    await db.update(groupStudyRooms).set({ current_participants: participantCount[0].count }).where(eq(groupStudyRooms.id, roomId));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
import connectPgSimple from "connect-pg-simple";
var PgSession = connectPgSimple(session);
var sessionConfig = {
  secret: process.env.SESSION_SECRET || "development-secret-key",
  resave: false,
  saveUninitialized: false,
  // Use PostgreSQL session store for production persistence in serverless environments
  store: new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: true
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1e3
    // 24 hours
  }
};
async function seedAchievements() {
  const existingAchievements = await storage.getAllAchievements();
  if (existingAchievements.length === 0) {
    const achievements2 = [
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
        unlock_criteria: { type: "total_xp", target: 1e3 }
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
    for (const achievement of achievements2) {
      try {
        const validatedAchievement = insertAchievementSchema.parse(achievement);
        await storage.createAchievement(validatedAchievement);
      } catch (error) {
        console.log("Could not seed achievement:", achievement.name);
      }
    }
  }
}
async function registerRoutes(app2) {
  app2.use(session(sessionConfig));
  await seedAchievements();
  const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });
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
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid input" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = z.object({
        username: z.string(),
        password: z.string()
      }).parse(req.body);
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
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
      res.status(400).json({ message: "Invalid input" });
    }
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
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
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.post("/api/sessions", requireAuth, async (req, res) => {
    try {
      const sessionData = insertStudySessionSchema.parse(req.body);
      const session2 = await storage.createStudySession(req.session.userId, sessionData);
      const xpGained = Math.floor(sessionData.duration_minutes * 2);
      await storage.updateUserXP(req.session.userId, xpGained);
      const user = await storage.getUser(req.session.userId);
      if (user) {
        const today = /* @__PURE__ */ new Date();
        const lastStudy = user.last_study_date ? new Date(user.last_study_date) : null;
        const isToday = lastStudy && today.toDateString() === lastStudy.toDateString();
        if (!isToday) {
          await storage.updateUserStreak(req.session.userId, (user.study_streak || 0) + 1);
        }
      }
      res.json(session2);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid input" });
    }
  });
  app2.get("/api/sessions/me", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const sessions = await storage.getUserStudySessions(req.session.userId, limit);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/events", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate) : void 0;
      const end = endDate ? new Date(endDate) : void 0;
      const events = await storage.getUserCalendarEvents(req.session.userId, start, end);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/events", requireAuth, async (req, res) => {
    try {
      const eventData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(req.session.userId, eventData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid input" });
    }
  });
  app2.patch("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const eventId = req.params.id;
      const updates = req.body;
      await storage.updateCalendarEvent(eventId, updates);
      res.json({ message: "Event updated" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/achievements", requireAuth, async (req, res) => {
    try {
      const achievements2 = await storage.getAllAchievements();
      res.json(achievements2);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/achievements/me", requireAuth, async (req, res) => {
    try {
      const userAchievements2 = await storage.getUserAchievements(req.session.userId);
      res.json(userAchievements2);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/rooms", async (req, res) => {
    try {
      const rooms = await storage.getActiveGroupRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/rooms", requireAuth, async (req, res) => {
    try {
      const roomData = req.body;
      const room = await storage.createGroupRoom(req.session.userId, roomData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid input" });
    }
  });
  app2.post("/api/rooms/:id/join", requireAuth, async (req, res) => {
    try {
      const roomId = req.params.id;
      await storage.joinRoom(roomId, req.session.userId);
      res.json({ message: "Joined room successfully" });
    } catch (error) {
      res.status(400).json({ message: "Could not join room" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
