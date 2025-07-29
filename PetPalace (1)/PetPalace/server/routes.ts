import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, signupSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import * as crypto from "crypto";
import { 
  insertUserSchema, 
  insertPetSchema, 
  insertSitterSchema, 
  insertServiceSchema,
  insertSocialPostSchema,
  insertCommentSchema,
  insertLikeSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Middleware to check authentication
  const requireAuth = async (req: any, res: any, next: any) => {
    const sessionId = req.headers['authorization'];
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

  // Hash password function
  const hashPassword = (password: string): string => {
    return crypto.createHash('sha256').update(password).digest('hex');
  };

  // User routes
  app.get("/api/users/:id", async (req, res) => {
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

  app.patch("/api/users/:id", async (req, res) => {
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

  // Pet routes (protected)
  app.get("/api/pets", requireAuth, async (req: any, res) => {
    try {
      const pets = await storage.getPetsByUserId(req.user.id);
      res.json(pets);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/pets", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertPetSchema.parse({
        ...req.body,
        userId: req.user.id // Ensure pet belongs to authenticated user
      });
      const newPet = await storage.createPet(validatedData);
      res.status(201).json(newPet);
    } catch (error) {
      res.status(400).json({ message: "Invalid pet data" });
    }
  });

  app.get("/api/pets/:id", requireAuth, async (req: any, res) => {
    try {
      const pet = await storage.getPet(req.params.id);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      // Ensure user can only access their own pets
      if (pet.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(pet);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/pets/:id", requireAuth, async (req: any, res) => {
    try {
      const pet = await storage.getPet(req.params.id);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      // Ensure user can only update their own pets
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

  app.delete("/api/pets/:id", requireAuth, async (req: any, res) => {
    try {
      const pet = await storage.getPet(req.params.id);
      if (!pet) {
        return res.status(404).json({ message: "Pet not found" });
      }
      // Ensure user can only delete their own pets
      if (pet.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const deleted = await storage.deletePet(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sitter routes
  app.get("/api/sitters", async (req, res) => {
    try {
      const sitters = await storage.getAllSitters();
      res.json(sitters);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/sitters/:id", async (req, res) => {
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

  // Service routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
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

  // Social post routes
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const validatedData = insertSocialPostSchema.parse(req.body);
      const newPost = await storage.createPost(validatedData);
      res.status(201).json(newPost);
    } catch (error) {
      res.status(400).json({ message: "Invalid post data" });
    }
  });

  app.patch("/api/posts/:id", async (req, res) => {
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

  app.delete("/api/posts/:id", async (req, res) => {
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

  // Comment routes
  app.get("/api/posts/:postId/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByPostId(req.params.postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const newComment = await storage.createComment(validatedData);
      res.status(201).json(newComment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  // Like routes
  app.get("/api/posts/:postId/likes", async (req, res) => {
    try {
      const likes = await storage.getLikesByPostId(req.params.postId);
      res.json(likes);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/likes", async (req, res) => {
    try {
      const validatedData = insertLikeSchema.parse(req.body);
      const newLike = await storage.createLike(validatedData);
      res.status(201).json(newLike);
    } catch (error) {
      res.status(400).json({ message: "Invalid like data" });
    }
  });

  app.delete("/api/likes/:postId/:userId", async (req, res) => {
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

  // Auth routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password and create user
      const hashedPassword = hashPassword(validatedData.password);
      const user = await storage.createUserAccount({
        ...validatedData,
        password: hashedPassword
      });

      // Create session
      const session = await storage.createSession(user.id);

      res.status(201).json({
        user: { ...user, password: undefined }, // Don't send password back
        sessionToken: session.id
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
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

      // Create session
      const session = await storage.createSession(user.id);

      res.json({
        user: { ...user, password: undefined }, // Don't send password back
        sessionToken: session.id
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post('/api/auth/logout', requireAuth, async (req: any, res) => {
    try {
      await storage.deleteSession(req.sessionId);
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  app.get('/api/auth/me', requireAuth, async (req: any, res) => {
    res.json({ ...req.user, password: undefined });
  });

  return httpServer;
}
