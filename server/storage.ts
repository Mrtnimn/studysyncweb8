import { 
  users, 
  studySessions,
  achievements,
  userAchievements,
  calendarEvents,
  groupStudyRooms,
  roomParticipants,
  tutorProfiles,
  tutorBookings,
  tutorReviews,
  type User, 
  type InsertUser,
  type StudySession,
  type InsertStudySession,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type CalendarEvent,
  type InsertCalendarEvent,
  type GroupStudyRoom,
  type TutorProfile,
  type InsertTutorProfile,
  type TutorBooking,
  type InsertTutorBooking,
  type TutorReview,
  type InsertTutorReview
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, gte, lte, count } from "drizzle-orm";
import { randomUUID } from "crypto";

// Extended interface with CRUD methods for all tables

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserXP(userId: string, xpGained: number): Promise<void>;
  updateUserStreak(userId: string, streak: number): Promise<void>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
  updateUserAvatar(userId: string, avatarUrl: string): Promise<void>;
  
  // Study Sessions
  createStudySession(userId: string, session: InsertStudySession): Promise<StudySession>;
  getUserStudySessions(userId: string, limit?: number): Promise<StudySession[]>;
  
  // Achievements
  getAllAchievements(): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]>;
  unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  
  // Calendar Events
  createCalendarEvent(userId: string, event: InsertCalendarEvent): Promise<CalendarEvent>;
  getUserCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]>;
  updateCalendarEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void>;
  
  // Group Study Rooms
  getActiveGroupRooms(): Promise<GroupStudyRoom[]>;
  createGroupRoom(hostUserId: string, roomData: Partial<GroupStudyRoom>): Promise<GroupStudyRoom>;
  joinRoom(roomId: string, userId: string): Promise<void>;
  
  // Tutor Profiles
  createTutorProfile(userId: string, profileData: InsertTutorProfile): Promise<TutorProfile>;
  getTutorProfile(userId: string): Promise<TutorProfile | undefined>;
  getTutorProfileById(tutorId: string): Promise<TutorProfile | undefined>;
  updateTutorProfile(tutorId: string, updates: Partial<TutorProfile>): Promise<void>;
  searchTutors(filters: { subject?: string, minRating?: number, maxRate?: number }): Promise<TutorProfile[]>;
  
  // Tutor Bookings
  createTutorBooking(studentId: string, bookingData: InsertTutorBooking): Promise<TutorBooking>;
  getTutorBookings(tutorId: string): Promise<TutorBooking[]>;
  getStudentBookings(studentId: string): Promise<TutorBooking[]>;
  updateBookingStatus(bookingId: string, status: string): Promise<void>;
  
  // Tutor Reviews
  createTutorReview(studentId: string, reviewData: InsertTutorReview): Promise<TutorReview>;
  getTutorReviews(tutorId: string): Promise<TutorReview[]>;
  updateTutorRating(tutorId: string): Promise<void>;
}

// Database storage implementation following blueprint:javascript_database pattern
export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserXP(userId: string, xpGained: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        total_xp: sql`${users.total_xp} + ${xpGained}`,
        updated_at: new Date() 
      })
      .where(eq(users.id, userId));
  }

  async updateUserStreak(userId: string, streak: number): Promise<void> {
    await db
      .update(users)
      .set({ 
        study_streak: streak,
        longest_streak: sql`GREATEST(${users.longest_streak}, ${streak})`,
        last_study_date: new Date(),
        updated_at: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        password: hashedPassword,
        updated_at: new Date()
      })
      .where(eq(users.id, userId));
  }

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
    await db
      .update(users)
      .set({ 
        avatar_url: avatarUrl,
        updated_at: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Study Sessions
  async createStudySession(userId: string, session: InsertStudySession): Promise<StudySession> {
    const [newSession] = await db
      .insert(studySessions)
      .values({ ...session, user_id: userId })
      .returning();
    return newSession;
  }

  async getUserStudySessions(userId: string, limit = 10): Promise<StudySession[]> {
    return await db
      .select()
      .from(studySessions)
      .where(eq(studySessions.user_id, userId))
      .orderBy(desc(studySessions.completed_at))
      .limit(limit);
  }

  // Achievements
  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db
      .insert(achievements)
      .values([achievement])
      .returning();
    return newAchievement;
  }

  async getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const result = await db
      .select({
        id: userAchievements.id,
        user_id: userAchievements.user_id,
        achievement_id: userAchievements.achievement_id,
        unlocked_at: userAchievements.unlocked_at,
        is_featured: userAchievements.is_featured,
        achievement: achievements
      })
      .from(userAchievements)
      .leftJoin(achievements, eq(userAchievements.achievement_id, achievements.id))
      .where(eq(userAchievements.user_id, userId))
      .orderBy(desc(userAchievements.unlocked_at));
      
    return result.map(row => ({
      ...row,
      achievement: row.achievement!
    })) as (UserAchievement & { achievement: Achievement })[];
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const [newAchievement] = await db
      .insert(userAchievements)
      .values({ user_id: userId, achievement_id: achievementId })
      .returning();
    return newAchievement;
  }

  // Calendar Events
  async createCalendarEvent(userId: string, event: InsertCalendarEvent): Promise<CalendarEvent> {
    const [newEvent] = await db
      .insert(calendarEvents)
      .values({ ...event, user_id: userId })
      .returning();
    return newEvent;
  }

  async getUserCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> {
    let conditions = [eq(calendarEvents.user_id, userId)];
    
    if (startDate && endDate) {
      conditions.push(
        gte(calendarEvents.start_time, startDate),
        lte(calendarEvents.end_time, endDate)
      );
    }
    
    return await db
      .select()
      .from(calendarEvents)
      .where(and(...conditions))
      .orderBy(calendarEvents.start_time);
  }

  async updateCalendarEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void> {
    await db
      .update(calendarEvents)
      .set(updates)
      .where(eq(calendarEvents.id, eventId));
  }

  // Group Study Rooms
  async getActiveGroupRooms(): Promise<GroupStudyRoom[]> {
    return await db
      .select()
      .from(groupStudyRooms)
      .where(eq(groupStudyRooms.is_active, true))
      .orderBy(desc(groupStudyRooms.created_at));
  }

  async createGroupRoom(hostUserId: string, roomData: Partial<GroupStudyRoom>): Promise<GroupStudyRoom> {
    const [newRoom] = await db
      .insert(groupStudyRooms)
      .values({ 
        name: roomData.name || 'New Study Room',
        subject: roomData.subject || 'General',
        description: roomData.description,
        host_user_id: hostUserId,
        max_participants: roomData.max_participants || 8,
        level_requirement: roomData.level_requirement || 'Beginner'
      })
      .returning();
    return newRoom;
  }

  async joinRoom(roomId: string, userId: string): Promise<void> {
    await db
      .insert(roomParticipants)
      .values({ room_id: roomId, user_id: userId });
    
    // Update participant count
    const participantCount = await db
      .select({ count: count() })
      .from(roomParticipants)
      .where(and(
        eq(roomParticipants.room_id, roomId),
        eq(roomParticipants.is_active, true)
      ));
      
    await db
      .update(groupStudyRooms)
      .set({ current_participants: participantCount[0].count })
      .where(eq(groupStudyRooms.id, roomId));
  }

  // Tutor Profiles
  async createTutorProfile(userId: string, profileData: InsertTutorProfile): Promise<TutorProfile> {
    const [profile] = await db
      .insert(tutorProfiles)
      .values({ ...profileData, user_id: userId })
      .returning();
    return profile;
  }

  async getTutorProfile(userId: string): Promise<TutorProfile | undefined> {
    const [profile] = await db
      .select()
      .from(tutorProfiles)
      .where(eq(tutorProfiles.user_id, userId));
    return profile || undefined;
  }

  async getTutorProfileById(tutorId: string): Promise<TutorProfile | undefined> {
    const [profile] = await db
      .select()
      .from(tutorProfiles)
      .where(eq(tutorProfiles.id, tutorId));
    return profile || undefined;
  }

  async updateTutorProfile(tutorId: string, updates: Partial<TutorProfile>): Promise<void> {
    await db
      .update(tutorProfiles)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(tutorProfiles.id, tutorId));
  }

  async searchTutors(filters: { subject?: string, minRating?: number, maxRate?: number }): Promise<TutorProfile[]> {
    const conditions = [eq(tutorProfiles.is_active, true)];
    
    if (filters.subject) {
      conditions.push(sql`${filters.subject} = ANY(${tutorProfiles.subjects})`);
    }
    
    if (filters.minRating) {
      conditions.push(gte(tutorProfiles.average_rating, filters.minRating * 100)); // Convert to out of 500
    }
    
    if (filters.maxRate) {
      conditions.push(lte(tutorProfiles.hourly_rate, filters.maxRate * 100)); // Convert to cents
    }

    return await db
      .select()
      .from(tutorProfiles)
      .where(and(...conditions))
      .orderBy(desc(tutorProfiles.average_rating));
  }

  // Tutor Bookings
  async createTutorBooking(studentId: string, bookingData: InsertTutorBooking): Promise<TutorBooking> {
    // Get tutor's current rate
    const tutor = await this.getTutorProfileById(bookingData.tutor_id);
    if (!tutor) {
      throw new Error('Tutor not found');
    }

    const totalCost = Math.round((bookingData.duration_minutes / 60) * tutor.hourly_rate);

    const [booking] = await db
      .insert(tutorBookings)
      .values({
        ...bookingData,
        student_id: studentId,
        hourly_rate: tutor.hourly_rate,
        total_cost: totalCost
      })
      .returning();
    return booking;
  }

  async getTutorBookings(tutorId: string): Promise<TutorBooking[]> {
    return await db
      .select()
      .from(tutorBookings)
      .where(eq(tutorBookings.tutor_id, tutorId))
      .orderBy(desc(tutorBookings.session_date));
  }

  async getStudentBookings(studentId: string): Promise<TutorBooking[]> {
    return await db
      .select()
      .from(tutorBookings)
      .where(eq(tutorBookings.student_id, studentId))
      .orderBy(desc(tutorBookings.session_date));
  }

  async updateBookingStatus(bookingId: string, status: string): Promise<void> {
    await db
      .update(tutorBookings)
      .set({ status, updated_at: new Date() })
      .where(eq(tutorBookings.id, bookingId));
  }

  // Tutor Reviews
  async createTutorReview(studentId: string, reviewData: InsertTutorReview): Promise<TutorReview> {
    const [review] = await db
      .insert(tutorReviews)
      .values({
        ...reviewData,
        student_id: studentId,
      })
      .returning();

    // Update tutor's average rating
    await this.updateTutorRating(reviewData.tutor_id);
    
    return review;
  }

  async getTutorReviews(tutorId: string): Promise<TutorReview[]> {
    return await db
      .select()
      .from(tutorReviews)
      .where(eq(tutorReviews.tutor_id, tutorId))
      .orderBy(desc(tutorReviews.created_at));
  }

  async updateTutorRating(tutorId: string): Promise<void> {
    const reviews = await this.getTutorReviews(tutorId);
    
    if (reviews.length > 0) {
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      await db
        .update(tutorProfiles)
        .set({
          average_rating: Math.round(averageRating * 100), // Convert to out of 500 (5.0 = 500)
          total_reviews: reviews.length,
          updated_at: new Date()
        })
        .where(eq(tutorProfiles.id, tutorId));
    }
  }
}

// Keep MemStorage for backwards compatibility during transition
export class MemStorage implements IStorage {
  private users: Map<string, User>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      id,
      email: insertUser.email || null,
      avatar_url: null,
      display_name: insertUser.display_name || null,
      study_level: 1,
      total_xp: 0,
      study_streak: 0,
      longest_streak: 0,
      last_study_date: null,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Placeholder implementations for extended interface
  async updateUserXP(userId: string, xpGained: number): Promise<void> {}
  async updateUserStreak(userId: string, streak: number): Promise<void> {}
  async updateUserPassword(userId: string, hashedPassword: string): Promise<void> {}
  async updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {}
  async createStudySession(userId: string, session: InsertStudySession): Promise<StudySession> {
    throw new Error('Study sessions not supported in memory storage');
  }
  async getUserStudySessions(userId: string, limit?: number): Promise<StudySession[]> { return []; }
  async getAllAchievements(): Promise<Achievement[]> { return []; }
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    throw new Error('Achievements not supported in memory storage');
  }
  async getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> { return []; }
  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    throw new Error('Achievements not supported in memory storage');
  }
  async createCalendarEvent(userId: string, event: InsertCalendarEvent): Promise<CalendarEvent> {
    throw new Error('Calendar events not supported in memory storage');
  }
  async getUserCalendarEvents(userId: string, startDate?: Date, endDate?: Date): Promise<CalendarEvent[]> { return []; }
  async updateCalendarEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<void> {}
  async getActiveGroupRooms(): Promise<GroupStudyRoom[]> { return []; }
  async createGroupRoom(hostUserId: string, roomData: Partial<GroupStudyRoom>): Promise<GroupStudyRoom> {
    throw new Error('Group rooms not supported in memory storage');
  }
  async joinRoom(roomId: string, userId: string): Promise<void> {}
  
  // Tutor Profiles - placeholder implementations
  async createTutorProfile(userId: string, profileData: InsertTutorProfile): Promise<TutorProfile> {
    throw new Error('Tutor profiles not supported in memory storage');
  }
  async getTutorProfile(userId: string): Promise<TutorProfile | undefined> { return undefined; }
  async getTutorProfileById(tutorId: string): Promise<TutorProfile | undefined> { return undefined; }
  async updateTutorProfile(tutorId: string, updates: Partial<TutorProfile>): Promise<void> {}
  async searchTutors(filters: { subject?: string, minRating?: number, maxRate?: number }): Promise<TutorProfile[]> { return []; }
  
  // Tutor Bookings - placeholder implementations
  async createTutorBooking(studentId: string, bookingData: InsertTutorBooking): Promise<TutorBooking> {
    throw new Error('Tutor bookings not supported in memory storage');
  }
  async getTutorBookings(tutorId: string): Promise<TutorBooking[]> { return []; }
  async getStudentBookings(studentId: string): Promise<TutorBooking[]> { return []; }
  async updateBookingStatus(bookingId: string, status: string): Promise<void> {}
  
  // Tutor Reviews - placeholder implementations
  async createTutorReview(studentId: string, reviewData: InsertTutorReview): Promise<TutorReview> {
    throw new Error('Tutor reviews not supported in memory storage');
  }
  async getTutorReviews(tutorId: string): Promise<TutorReview[]> { return []; }
  async updateTutorRating(tutorId: string): Promise<void> {}
}

// Use DatabaseStorage for production persistence - following blueprint:javascript_database
export const storage = new DatabaseStorage();
