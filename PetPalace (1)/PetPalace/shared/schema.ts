import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  profilePicture: text("profile_picture"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactRelationship: text("emergency_contact_relationship"),
  emergencyContactEmail: text("emergency_contact_email"),
  settings: jsonb("settings").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const pets = pgTable("pets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  breed: text("breed").notNull(),
  age: integer("age").notNull(),
  type: text("type").notNull(), // dog, cat, etc.
  image: text("image"),
  description: text("description"),
  healthStatus: text("health_status").default("healthy"),
  medications: jsonb("medications").default(sql`'[]'::jsonb`),
  appointments: jsonb("appointments").default(sql`'[]'::jsonb`),
});

export const petSitters = pgTable("pet_sitters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  pricePerDay: decimal("price_per_day", { precision: 8, scale: 2 }).notNull(),
  distance: decimal("distance", { precision: 5, scale: 2 }).notNull(),
  image: text("image"),
  location: text("location").notNull(),
  experience: text("experience"),
  specialties: jsonb("specialties").default(sql`'[]'::jsonb`),
  availability: boolean("availability").default(true),
});

export const petServices = pgTable("pet_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // store, trainer, grooming, etc.
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  priceRange: text("price_range"),
  distance: decimal("distance", { precision: 5, scale: 2 }).notNull(),
  image: text("image"),
  location: text("location").notNull(),
  services: jsonb("services").default(sql`'[]'::jsonb`),
});

export const socialPosts = pgTable("social_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  petId: varchar("pet_id").references(() => pets.id),
  content: text("content").notNull(),
  image: text("image"),
  likes: integer("likes").default(0),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => socialPosts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => socialPosts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertPetSchema = createInsertSchema(pets).omit({
  id: true,
});

export const insertSitterSchema = createInsertSchema(petSitters).omit({
  id: true,
});

export const insertServiceSchema = createInsertSchema(petServices).omit({
  id: true,
});

export const insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
});

export const insertLikeSchema = createInsertSchema(postLikes).omit({
  id: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Pet = typeof pets.$inferSelect;
export type InsertPet = z.infer<typeof insertPetSchema>;
export type PetSitter = typeof petSitters.$inferSelect;
export type InsertSitter = z.infer<typeof insertSitterSchema>;
export type PetService = typeof petServices.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialPost = z.infer<typeof insertSocialPostSchema>;
export type PostComment = typeof postComments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type PostLike = typeof postLikes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type SignupData = z.infer<typeof signupSchema>;
