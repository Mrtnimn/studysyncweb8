import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
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
  updated_at: timestamp("updated_at").defaultNow(),
});

export const studySessions = pgTable("study_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  duration_minutes: integer("duration_minutes").notNull(),
  xp_earned: integer("xp_earned").default(0),
  session_type: text("session_type").notNull(), // 'solo' | 'group' | 'tutoring'
  focus_score: integer("focus_score"), // 1-100 rating
  notes: text("notes"),
  completed_at: timestamp("completed_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xp_reward: integer("xp_reward").default(0),
  badge_color: text("badge_color").default('blue'),
  category: text("category").notNull(), // 'streak' | 'xp' | 'social' | 'focus'
  unlock_criteria: jsonb("unlock_criteria").notNull(), // JSON criteria for unlocking
  created_at: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  achievement_id: varchar("achievement_id").notNull().references(() => achievements.id),
  unlocked_at: timestamp("unlocked_at").defaultNow(),
  is_featured: boolean("is_featured").default(false),
});

export const calendarEvents = pgTable("calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time").notNull(),
  session_type: text("session_type").notNull(),
  status: text("status").default('scheduled'), // 'scheduled' | 'completed' | 'cancelled'
  reminder_minutes: integer("reminder_minutes").default(15),
  created_at: timestamp("created_at").defaultNow(),
});

export const groupStudyRooms = pgTable("group_study_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  host_user_id: varchar("host_user_id").notNull().references(() => users.id),
  max_participants: integer("max_participants").default(8),
  current_participants: integer("current_participants").default(0),
  is_active: boolean("is_active").default(true),
  level_requirement: text("level_requirement").default('Beginner'),
  created_at: timestamp("created_at").defaultNow(),
});

export const roomParticipants = pgTable("room_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  room_id: varchar("room_id").notNull().references(() => groupStudyRooms.id),
  user_id: varchar("user_id").notNull().references(() => users.id),
  joined_at: timestamp("joined_at").defaultNow(),
  left_at: timestamp("left_at"),
  is_active: boolean("is_active").default(true),
});

export const tutorProfiles = pgTable("tutor_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull().references(() => users.id),
  bio: text("bio").notNull(),
  hourly_rate: integer("hourly_rate").notNull(), // in cents
  subjects: text("subjects").array().notNull(),
  languages: text("languages").array().default([]),
  education: text("education"),
  experience_years: integer("experience_years").default(0),
  availability: jsonb("availability").notNull(), // JSON object for availability schedule
  timezone: text("timezone").default('UTC'),
  is_active: boolean("is_active").default(true),
  total_sessions: integer("total_sessions").default(0),
  average_rating: integer("average_rating").default(0), // out of 100 (5.0 = 500)
  total_reviews: integer("total_reviews").default(0),
  response_time_hours: integer("response_time_hours").default(24),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const tutorBookings = pgTable("tutor_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  student_id: varchar("student_id").notNull().references(() => users.id),
  tutor_id: varchar("tutor_id").notNull().references(() => tutorProfiles.id),
  subject: text("subject").notNull(),
  session_date: timestamp("session_date").notNull(),
  duration_minutes: integer("duration_minutes").notNull(),
  hourly_rate: integer("hourly_rate").notNull(), // rate at time of booking
  total_cost: integer("total_cost").notNull(), // in cents
  status: text("status").default('pending'), // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  session_notes: text("session_notes"),
  meeting_link: text("meeting_link"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const tutorReviews = pgTable("tutor_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  booking_id: varchar("booking_id").notNull().references(() => tutorBookings.id),
  student_id: varchar("student_id").notNull().references(() => users.id),
  tutor_id: varchar("tutor_id").notNull().references(() => tutorProfiles.id),
  rating: integer("rating").notNull(), // 1-5 scale
  review_text: text("review_text"),
  created_at: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  studySessions: many(studySessions),
  userAchievements: many(userAchievements),
  calendarEvents: many(calendarEvents),
  hostedRooms: many(groupStudyRooms),
  roomParticipations: many(roomParticipants),
  tutorProfile: one(tutorProfiles),
  tutorBookingsAsStudent: many(tutorBookings, { relationName: "studentBookings" }),
  tutorReviewsAsStudent: many(tutorReviews, { relationName: "studentReviews" }),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  user: one(users, {
    fields: [studySessions.user_id],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.user_id],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievement_id],
    references: [achievements.id],
  }),
}));

export const calendarEventsRelations = relations(calendarEvents, ({ one }) => ({
  user: one(users, {
    fields: [calendarEvents.user_id],
    references: [users.id],
  }),
}));

export const groupStudyRoomsRelations = relations(groupStudyRooms, ({ one, many }) => ({
  host: one(users, {
    fields: [groupStudyRooms.host_user_id],
    references: [users.id],
  }),
  participants: many(roomParticipants),
}));

export const roomParticipantsRelations = relations(roomParticipants, ({ one }) => ({
  room: one(groupStudyRooms, {
    fields: [roomParticipants.room_id],
    references: [groupStudyRooms.id],
  }),
  user: one(users, {
    fields: [roomParticipants.user_id],
    references: [users.id],
  }),
}));

export const tutorProfilesRelations = relations(tutorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [tutorProfiles.user_id],
    references: [users.id],
  }),
  bookings: many(tutorBookings),
  reviews: many(tutorReviews),
}));

export const tutorBookingsRelations = relations(tutorBookings, ({ one }) => ({
  student: one(users, {
    fields: [tutorBookings.student_id],
    references: [users.id],
    relationName: "studentBookings",
  }),
  tutor: one(tutorProfiles, {
    fields: [tutorBookings.tutor_id],
    references: [tutorProfiles.id],
  }),
  review: one(tutorReviews),
}));

export const tutorReviewsRelations = relations(tutorReviews, ({ one }) => ({
  booking: one(tutorBookings, {
    fields: [tutorReviews.booking_id],
    references: [tutorBookings.id],
  }),
  student: one(users, {
    fields: [tutorReviews.student_id],
    references: [users.id],
    relationName: "studentReviews",
  }),
  tutor: one(tutorProfiles, {
    fields: [tutorReviews.tutor_id],
    references: [tutorProfiles.id],
  }),
}));

// Zod Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  display_name: true,
});

export const insertStudySessionSchema = createInsertSchema(studySessions).pick({
  subject: true,
  duration_minutes: true,
  session_type: true,
  focus_score: true,
  notes: true,
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).pick({
  title: true,
  subject: true,
  start_time: true,
  end_time: true,
  session_type: true,
  reminder_minutes: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).pick({
  name: true,
  description: true,
  icon: true,
  xp_reward: true,
  badge_color: true,
  category: true,
  unlock_criteria: true,
});

export const insertTutorProfileSchema = createInsertSchema(tutorProfiles).pick({
  bio: true,
  hourly_rate: true,
  subjects: true,
  languages: true,
  education: true,
  experience_years: true,
  availability: true,
  timezone: true,
  response_time_hours: true,
});

export const insertTutorBookingSchema = createInsertSchema(tutorBookings).pick({
  tutor_id: true,
  subject: true,
  session_date: true,
  duration_minutes: true,
  session_notes: true,
});

export const insertTutorReviewSchema = createInsertSchema(tutorReviews).pick({
  booking_id: true,
  rating: true,
  review_text: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type GroupStudyRoom = typeof groupStudyRooms.$inferSelect;
export type RoomParticipant = typeof roomParticipants.$inferSelect;
export type TutorProfile = typeof tutorProfiles.$inferSelect;
export type InsertTutorProfile = z.infer<typeof insertTutorProfileSchema>;
export type TutorBooking = typeof tutorBookings.$inferSelect;
export type InsertTutorBooking = z.infer<typeof insertTutorBookingSchema>;
export type TutorReview = typeof tutorReviews.$inferSelect;
export type InsertTutorReview = z.infer<typeof insertTutorReviewSchema>;
