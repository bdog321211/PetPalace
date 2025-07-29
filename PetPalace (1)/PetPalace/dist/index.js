var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertCommentSchema: () => insertCommentSchema,
  insertLikeSchema: () => insertLikeSchema,
  insertPetSchema: () => insertPetSchema,
  insertServiceSchema: () => insertServiceSchema,
  insertSessionSchema: () => insertSessionSchema,
  insertSitterSchema: () => insertSitterSchema,
  insertSocialPostSchema: () => insertSocialPostSchema,
  insertUserSchema: () => insertUserSchema,
  loginSchema: () => loginSchema,
  petServices: () => petServices,
  petSitters: () => petSitters,
  pets: () => pets,
  postComments: () => postComments,
  postLikes: () => postLikes,
  sessions: () => sessions,
  signupSchema: () => signupSchema,
  socialPosts: () => socialPosts,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
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
  createdAt: timestamp("created_at").default(sql`now()`)
});
var pets = pgTable("pets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  breed: text("breed").notNull(),
  age: integer("age").notNull(),
  type: text("type").notNull(),
  // dog, cat, etc.
  image: text("image"),
  description: text("description"),
  healthStatus: text("health_status").default("healthy"),
  medications: jsonb("medications").default(sql`'[]'::jsonb`),
  appointments: jsonb("appointments").default(sql`'[]'::jsonb`)
});
var petSitters = pgTable("pet_sitters", {
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
  availability: boolean("availability").default(true)
});
var petServices = pgTable("pet_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  // store, trainer, grooming, etc.
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  priceRange: text("price_range"),
  distance: decimal("distance", { precision: 5, scale: 2 }).notNull(),
  image: text("image"),
  location: text("location").notNull(),
  services: jsonb("services").default(sql`'[]'::jsonb`)
});
var socialPosts = pgTable("social_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  petId: varchar("pet_id").references(() => pets.id),
  content: text("content").notNull(),
  image: text("image"),
  likes: integer("likes").default(0),
  rating: decimal("rating", { precision: 2, scale: 1 }),
  createdAt: timestamp("created_at").default(sql`now()`)
});
var postComments = pgTable("post_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => socialPosts.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`)
});
var postLikes = pgTable("post_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => socialPosts.id),
  userId: varchar("user_id").notNull().references(() => users.id)
});
var sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`)
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true
});
var insertPetSchema = createInsertSchema(pets).omit({
  id: true
});
var insertSitterSchema = createInsertSchema(petSitters).omit({
  id: true
});
var insertServiceSchema = createInsertSchema(petServices).omit({
  id: true
});
var insertSocialPostSchema = createInsertSchema(socialPosts).omit({
  id: true,
  createdAt: true
});
var insertCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true
});
var insertLikeSchema = createInsertSchema(postLikes).omit({
  id: true
});
var insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true
});
var loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required")
});
var signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required")
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  // Authentication methods
  async createUserAccount(userData) {
    const [user] = await db.insert(users).values({
      ...userData,
      settings: { theme: "light", notifications: true }
    }).returning();
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createSession(userId) {
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const [session] = await db.insert(sessions).values({
      userId,
      expiresAt
    }).returning();
    return session;
  }
  async getSession(sessionId) {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
    if (session && session.expiresAt < /* @__PURE__ */ new Date()) {
      await this.deleteSession(sessionId);
      return void 0;
    }
    return session || void 0;
  }
  async deleteSession(sessionId) {
    const result = await db.delete(sessions).where(eq(sessions.id, sessionId));
    return (result.rowCount || 0) > 0;
  }
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async updateUser(id, updateData) {
    const [user] = await db.update(users).set(updateData).where(eq(users.id, id)).returning();
    return user || void 0;
  }
  // Pets
  async getPetsByUserId(userId) {
    return await db.select().from(pets).where(eq(pets.userId, userId));
  }
  async getPet(id) {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet || void 0;
  }
  async createPet(insertPet) {
    const [pet] = await db.insert(pets).values(insertPet).returning();
    return pet;
  }
  async updatePet(id, updateData) {
    const [pet] = await db.update(pets).set(updateData).where(eq(pets.id, id)).returning();
    return pet || void 0;
  }
  async deletePet(id) {
    const result = await db.delete(pets).where(eq(pets.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Pet Sitters
  async getAllSitters() {
    return await db.select().from(petSitters);
  }
  async getSitter(id) {
    const [sitter] = await db.select().from(petSitters).where(eq(petSitters.id, id));
    return sitter || void 0;
  }
  async createSitter(insertSitter) {
    const [sitter] = await db.insert(petSitters).values(insertSitter).returning();
    return sitter;
  }
  // Pet Services
  async getAllServices() {
    return await db.select().from(petServices);
  }
  async getService(id) {
    const [service] = await db.select().from(petServices).where(eq(petServices.id, id));
    return service || void 0;
  }
  async createService(insertService) {
    const [service] = await db.insert(petServices).values(insertService).returning();
    return service;
  }
  // Social Posts
  async getAllPosts() {
    return await db.select().from(socialPosts).orderBy(socialPosts.createdAt);
  }
  async getPost(id) {
    const [post] = await db.select().from(socialPosts).where(eq(socialPosts.id, id));
    return post || void 0;
  }
  async createPost(insertPost) {
    const [post] = await db.insert(socialPosts).values(insertPost).returning();
    return post;
  }
  async updatePost(id, updateData) {
    const [post] = await db.update(socialPosts).set(updateData).where(eq(socialPosts.id, id)).returning();
    return post || void 0;
  }
  async deletePost(id) {
    const result = await db.delete(socialPosts).where(eq(socialPosts.id, id));
    return (result.rowCount || 0) > 0;
  }
  // Comments
  async getCommentsByPostId(postId) {
    return await db.select().from(postComments).where(eq(postComments.postId, postId));
  }
  async createComment(insertComment) {
    const [comment] = await db.insert(postComments).values(insertComment).returning();
    return comment;
  }
  // Likes
  async getLikesByPostId(postId) {
    return await db.select().from(postLikes).where(eq(postLikes.postId, postId));
  }
  async createLike(insertLike) {
    const [like] = await db.insert(postLikes).values(insertLike).returning();
    return like;
  }
  async deleteLike(postId, userId) {
    const result = await db.delete(postLikes).where(eq(postLikes.postId, postId));
    return (result.rowCount || 0) > 0;
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { fromZodError } from "zod-validation-error";
import * as crypto from "crypto";
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const requireAuth = async (req, res, next) => {
    const sessionId = req.headers["authorization"];
    if (!sessionId) {
      return res.status(401).json({ message: "No session token provided" });
    }
    const session = await storage.getSession(sessionId);
    if (!session) {
      return res.status(401).json({ message: "Invalid or expired session" });
    }
    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    req.sessionId = sessionId;
    next();
  };
  const hashPassword = (password) => {
    return crypto.createHash("sha256").update(password).digest("hex");
  };
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/users/:id", async (req, res) => {
    try {
      const validatedData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(req.params.id, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  app2.get("/api/pets", requireAuth, async (req, res) => {
    try {
      const pets2 = await storage.getPetsByUserId(req.user.id);
      res.json(pets2);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/pets", requireAuth, async (req, res) => {
    try {
      const validatedData = insertPetSchema.parse({
        ...req.body,
        userId: req.user.id
        // Ensure pet belongs to authenticated user
      });
      const newPet = await storage.createPet(validatedData);
      res.status(201).json(newPet);
    } catch (error) {
      res.status(400).json({ message: "Invalid pet data" });
    }
  });
  app2.get("/api/pets/:id", requireAuth, async (req, res) => {
    try {
      const pet = await storage.getPet(req.params.id);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      if (pet.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(pet);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.patch("/api/pets/:id", requireAuth, async (req, res) => {
    try {
      const pet = await storage.getPet(req.params.id);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      if (pet.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const validatedData = insertPetSchema.partial().parse(req.body);
      const updatedPet = await storage.updatePet(req.params.id, validatedData);
      res.json(updatedPet);
    } catch (error) {
      res.status(400).json({ message: "Invalid pet data" });
    }
  });
  app2.delete("/api/pets/:id", requireAuth, async (req, res) => {
    try {
      const pet = await storage.getPet(req.params.id);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      if (pet.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      const deleted = await storage.deletePet(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/sitters", async (req, res) => {
    try {
      const sitters = await storage.getAllSitters();
      res.json(sitters);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/sitters/:id", async (req, res) => {
    try {
      const sitter = await storage.getSitter(req.params.id);
      if (!sitter) {
        return res.status(404).json({ message: "Sitter not found" });
      }
      res.json(sitter);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertSocialPostSchema.parse(req.body);
      const newPost = await storage.createPost(validatedData);
      res.status(201).json(newPost);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data" });
    }
  });
  app2.patch("/api/posts/:id", async (req, res) => {
    try {
      const validatedData = insertSocialPostSchema.partial().parse(req.body);
      const updatedPost = await storage.updatePost(req.params.id, validatedData);
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(updatedPost);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data" });
    }
  });
  app2.delete("/api/posts/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePost(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByPostId(req.params.postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const newComment = await storage.createComment(validatedData);
      res.status(201).json(newComment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });
  app2.get("/api/posts/:postId/likes", async (req, res) => {
    try {
      const likes = await storage.getLikesByPostId(req.params.postId);
      res.json(likes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/likes", async (req, res) => {
    try {
      const validatedData = insertLikeSchema.parse(req.body);
      const newLike = await storage.createLike(validatedData);
      res.status(201).json(newLike);
    } catch (error) {
      res.status(400).json({ message: "Invalid like data" });
    }
  });
  app2.delete("/api/likes/:postId/:userId", async (req, res) => {
    try {
      const deleted = await storage.deleteLike(req.params.postId, req.params.userId);
      if (!deleted) {
        return res.status(404).json({ message: "Like not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      const hashedPassword = hashPassword(validatedData.password);
      const user = await storage.createUserAccount({
        ...validatedData,
        password: hashedPassword
      });
      const session = await storage.createSession(user.id);
      res.status(201).json({
        user: { ...user, password: void 0 },
        // Don't send password back
        sessionToken: session.id
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      const hashedPassword = hashPassword(password);
      if (user.password !== hashedPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      const session = await storage.createSession(user.id);
      res.json({
        user: { ...user, password: void 0 },
        // Don't send password back
        sessionToken: session.id
      });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });
  app2.post("/api/auth/logout", requireAuth, async (req, res) => {
    try {
      await storage.deleteSession(req.sessionId);
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    res.json({ ...req.user, password: void 0 });
  });
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
