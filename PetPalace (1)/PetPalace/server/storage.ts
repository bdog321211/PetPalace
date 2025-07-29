import { 
  users, pets, petSitters, petServices, socialPosts, postComments, postLikes, sessions,
  type User, 
  type InsertUser, 
  type Pet, 
  type InsertPet,
  type PetSitter,
  type InsertSitter,
  type PetService,
  type InsertService,
  type SocialPost,
  type InsertSocialPost,
  type PostComment,
  type InsertComment,
  type PostLike,
  type InsertLike,
  type Session,
  type InsertSession,
  type LoginData,
  type SignupData
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Authentication
  createUserAccount(userData: SignupData): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createSession(userId: string): Promise<Session>;
  getSession(sessionId: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<boolean>;
  
  // Users
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Pets
  getPetsByUserId(userId: string): Promise<Pet[]>;
  getPet(id: string): Promise<Pet | undefined>;
  createPet(pet: InsertPet): Promise<Pet>;
  updatePet(id: string, pet: Partial<InsertPet>): Promise<Pet | undefined>;
  deletePet(id: string): Promise<boolean>;
  
  // Pet Sitters
  getAllSitters(): Promise<PetSitter[]>;
  getSitter(id: string): Promise<PetSitter | undefined>;
  createSitter(sitter: InsertSitter): Promise<PetSitter>;
  
  // Pet Services
  getAllServices(): Promise<PetService[]>;
  getService(id: string): Promise<PetService | undefined>;
  createService(service: InsertService): Promise<PetService>;
  
  // Social Posts
  getAllPosts(): Promise<SocialPost[]>;
  getPost(id: string): Promise<SocialPost | undefined>;
  createPost(post: InsertSocialPost): Promise<SocialPost>;
  updatePost(id: string, post: Partial<InsertSocialPost>): Promise<SocialPost | undefined>;
  deletePost(id: string): Promise<boolean>;
  
  // Comments
  getCommentsByPostId(postId: string): Promise<PostComment[]>;
  createComment(comment: InsertComment): Promise<PostComment>;
  
  // Likes
  getLikesByPostId(postId: string): Promise<PostLike[]>;
  createLike(like: InsertLike): Promise<PostLike>;
  deleteLike(postId: string, userId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private pets: Map<string, Pet>;
  private sitters: Map<string, PetSitter>;
  private services: Map<string, PetService>;
  private posts: Map<string, SocialPost>;
  private comments: Map<string, PostComment>;
  private likes: Map<string, PostLike>;

  constructor() {
    this.users = new Map();
    this.pets = new Map();
    this.sitters = new Map();
    this.services = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.likes = new Map();
    
    this.initializeData();
  }

  private initializeData() {
    // Create default user
    const defaultUser: User = {
      id: "user-1",
      username: "johndoe",
      email: "john.doe@email.com",
      firstName: "John",
      lastName: "Doe",
      phone: "+1 (555) 123-4567",
      address: "123 Pet Street, San Francisco, CA 94102",
      city: "San Francisco",
      profilePicture: null,
      emergencyContactName: "Jane Doe",
      emergencyContactPhone: "+1 (555) 987-6543",
      emergencyContactRelationship: "Sister",
      emergencyContactEmail: "jane.doe@email.com",
      settings: { theme: "light", notifications: true }
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create sample pets
    const samplePets: Pet[] = [
      {
        id: "pet-1",
        userId: "user-1",
        name: "Max",
        breed: "Golden Retriever",
        age: 2,
        type: "dog",
        image: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        description: "Friendly and energetic golden retriever",
        healthStatus: "healthy",
        medications: [],
        appointments: [{ type: "vet checkup", date: "2025-01-29T14:00:00Z", location: "City Vet Clinic" }]
      },
      {
        id: "pet-2",
        userId: "user-1",
        name: "Luna",
        breed: "Maine Coon",
        age: 4,
        type: "cat",
        image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        description: "Calm and affectionate maine coon",
        healthStatus: "healthy",
        medications: [],
        appointments: []
      },
      {
        id: "pet-3",
        userId: "user-1",
        name: "Buddy",
        breed: "Beagle",
        age: 1,
        type: "dog",
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
        description: "Playful beagle puppy",
        healthStatus: "healthy",
        medications: [{ name: "Heartworm pill", frequency: "monthly", nextDue: "2025-02-01" }],
        appointments: []
      }
    ];
    samplePets.forEach(pet => this.pets.set(pet.id, pet));

    // Create sample sitters
    const sampleSitters: PetSitter[] = [
      {
        id: "sitter-1",
        name: "Sarah Johnson",
        description: "Experienced pet sitter with 5+ years caring for dogs and cats",
        rating: "4.9",
        pricePerDay: "35.00",
        distance: "2.3",
        image: "https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        location: "Downtown",
        experience: "5+ years",
        specialties: ["dogs", "cats"],
        availability: true
      },
      {
        id: "sitter-2",
        name: "Mike Chen",
        description: "Dog trainer and sitter specializing in large breeds",
        rating: "4.7",
        pricePerDay: "45.00",
        distance: "1.8",
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        location: "Midtown",
        experience: "3+ years",
        specialties: ["large dogs", "training"],
        availability: true
      },
      {
        id: "sitter-3",
        name: "Emma Rodriguez",
        description: "Veterinary student with expertise in pet health and care",
        rating: "4.8",
        pricePerDay: "30.00",
        distance: "3.1",
        image: "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        location: "University District",
        experience: "2+ years",
        specialties: ["health care", "medication"],
        availability: true
      },
      {
        id: "sitter-4",
        name: "The Thompson Family",
        description: "Family home with large yard, perfect for active pets",
        rating: "4.6",
        pricePerDay: "25.00",
        distance: "4.2",
        image: "https://images.unsplash.com/photo-1544568100-847a948585b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        location: "Suburbs",
        experience: "4+ years",
        specialties: ["family environment", "large yard"],
        availability: true
      }
    ];
    sampleSitters.forEach(sitter => this.sitters.set(sitter.id, sitter));

    // Create sample services
    const sampleServices: PetService[] = [
      {
        id: "service-1",
        name: "PetMart Plus",
        description: "Full-service pet store with premium food, toys, and supplies",
        category: "store",
        rating: "4.5",
        priceRange: "$20-100",
        distance: "1.2",
        image: "https://images.unsplash.com/photo-1601758003122-53c40e686a19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        location: "Shopping Center",
        services: ["pet food", "toys", "supplies", "accessories"]
      },
      {
        id: "service-2",
        name: "K9 Excellence Training",
        description: "Professional dog training with certified trainers",
        category: "trainer",
        rating: "4.9",
        priceRange: "$80/session",
        distance: "2.1",
        image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        location: "Training Facility",
        services: ["basic training", "advanced training", "behavior modification"]
      },
      {
        id: "service-3",
        name: "Pampered Paws Spa",
        description: "Luxury grooming services for all breeds",
        category: "grooming",
        rating: "4.7",
        priceRange: "$65/session",
        distance: "0.8",
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        location: "Pet Spa",
        services: ["full grooming", "nail trim", "bath", "styling"]
      },
      {
        id: "service-4",
        name: "Healthy Tails Nutrition",
        description: "Organic and natural pet food specialist",
        category: "store",
        rating: "4.6",
        priceRange: "$30-150",
        distance: "3.5",
        image: "https://images.unsplash.com/photo-1601758003122-53c40e686a19?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
        location: "Health Food District",
        services: ["organic food", "supplements", "special diets"]
      }
    ];
    sampleServices.forEach(service => this.services.set(service.id, service));

    // Create sample social posts
    const samplePosts: SocialPost[] = [
      {
        id: "post-1",
        userId: "user-1",
        petId: "pet-1",
        content: "My little furry friend enjoying the sunshine! 🌞",
        image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        likes: 24,
        rating: "5.0",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        id: "post-2",
        userId: "user-1",
        petId: "pet-3",
        content: "Training session went amazing today! Look at this focus 💪",
        image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        likes: 31,
        rating: "4.0",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
      },
      {
        id: "post-3",
        userId: "user-1",
        petId: "pet-2",
        content: "Spa day complete! Luna is looking fabulous ✨",
        image: "https://images.unsplash.com/photo-1551717743-49959800b1f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        likes: 18,
        rating: "5.0",
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
      }
    ];
    samplePosts.forEach(post => this.posts.set(post.id, post));

    // Create sample comments
    const sampleComments: PostComment[] = [
      {
        id: "comment-1",
        postId: "post-1",
        userId: "user-1",
        content: "Adorable! What breed is this?",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
      },
      {
        id: "comment-2",
        postId: "post-1",
        userId: "user-1",
        content: "So cute! My corgi would love to be friends! 🐕",
        createdAt: new Date(Date.now() - 30 * 60 * 1000)
      }
    ];
    sampleComments.forEach(comment => this.comments.set(comment.id, comment));
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Pet methods
  async getPetsByUserId(userId: string): Promise<Pet[]> {
    return Array.from(this.pets.values()).filter(pet => pet.userId === userId);
  }

  async getPet(id: string): Promise<Pet | undefined> {
    return this.pets.get(id);
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const id = randomUUID();
    const pet: Pet = { ...insertPet, id };
    this.pets.set(id, pet);
    return pet;
  }

  async updatePet(id: string, updateData: Partial<InsertPet>): Promise<Pet | undefined> {
    const pet = this.pets.get(id);
    if (!pet) return undefined;
    
    const updatedPet = { ...pet, ...updateData };
    this.pets.set(id, updatedPet);
    return updatedPet;
  }

  async deletePet(id: string): Promise<boolean> {
    return this.pets.delete(id);
  }

  // Sitter methods
  async getAllSitters(): Promise<PetSitter[]> {
    return Array.from(this.sitters.values());
  }

  async getSitter(id: string): Promise<PetSitter | undefined> {
    return this.sitters.get(id);
  }

  async createSitter(insertSitter: InsertSitter): Promise<PetSitter> {
    const id = randomUUID();
    const sitter: PetSitter = { ...insertSitter, id };
    this.sitters.set(id, sitter);
    return sitter;
  }

  // Service methods
  async getAllServices(): Promise<PetService[]> {
    return Array.from(this.services.values());
  }

  async getService(id: string): Promise<PetService | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<PetService> {
    const id = randomUUID();
    const service: PetService = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  // Social post methods
  async getAllPosts(): Promise<SocialPost[]> {
    return Array.from(this.posts.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getPost(id: string): Promise<SocialPost | undefined> {
    return this.posts.get(id);
  }

  async createPost(insertPost: InsertSocialPost): Promise<SocialPost> {
    const id = randomUUID();
    const post: SocialPost = { 
      ...insertPost, 
      id, 
      createdAt: new Date(),
      likes: 0 
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, updateData: Partial<InsertSocialPost>): Promise<SocialPost | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updateData };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  // Comment methods
  async getCommentsByPostId(postId: string): Promise<PostComment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<PostComment> {
    const id = randomUUID();
    const comment: PostComment = { 
      ...insertComment, 
      id, 
      createdAt: new Date() 
    };
    this.comments.set(id, comment);
    return comment;
  }

  // Like methods
  async getLikesByPostId(postId: string): Promise<PostLike[]> {
    return Array.from(this.likes.values()).filter(like => like.postId === postId);
  }

  async createLike(insertLike: InsertLike): Promise<PostLike> {
    const id = randomUUID();
    const like: PostLike = { ...insertLike, id };
    this.likes.set(id, like);
    
    // Update post likes count
    const post = this.posts.get(insertLike.postId);
    if (post) {
      post.likes = (post.likes || 0) + 1;
      this.posts.set(post.id, post);
    }
    
    return like;
  }

  async deleteLike(postId: string, userId: string): Promise<boolean> {
    const like = Array.from(this.likes.values()).find(
      l => l.postId === postId && l.userId === userId
    );
    
    if (like) {
      this.likes.delete(like.id);
      
      // Update post likes count
      const post = this.posts.get(postId);
      if (post && post.likes && post.likes > 0) {
        post.likes = post.likes - 1;
        this.posts.set(post.id, post);
      }
      
      return true;
    }
    return false;
  }
}

export class DatabaseStorage implements IStorage {
  // Authentication methods
  async createUserAccount(userData: SignupData): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        settings: { theme: "light", notifications: true }
      })
      .returning();
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createSession(userId: string): Promise<Session> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
    
    const [session] = await db
      .insert(sessions)
      .values({
        userId,
        expiresAt
      })
      .returning();
    return session;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId));
    if (session && session.expiresAt < new Date()) {
      await this.deleteSession(sessionId);
      return undefined;
    }
    return session || undefined;
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.id, sessionId));
    return (result.rowCount || 0) > 0;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Pets
  async getPetsByUserId(userId: string): Promise<Pet[]> {
    return await db.select().from(pets).where(eq(pets.userId, userId));
  }

  async getPet(id: string): Promise<Pet | undefined> {
    const [pet] = await db.select().from(pets).where(eq(pets.id, id));
    return pet || undefined;
  }

  async createPet(insertPet: InsertPet): Promise<Pet> {
    const [pet] = await db
      .insert(pets)
      .values(insertPet)
      .returning();
    return pet;
  }

  async updatePet(id: string, updateData: Partial<InsertPet>): Promise<Pet | undefined> {
    const [pet] = await db
      .update(pets)
      .set(updateData)
      .where(eq(pets.id, id))
      .returning();
    return pet || undefined;
  }

  async deletePet(id: string): Promise<boolean> {
    const result = await db.delete(pets).where(eq(pets.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Pet Sitters
  async getAllSitters(): Promise<PetSitter[]> {
    return await db.select().from(petSitters);
  }

  async getSitter(id: string): Promise<PetSitter | undefined> {
    const [sitter] = await db.select().from(petSitters).where(eq(petSitters.id, id));
    return sitter || undefined;
  }

  async createSitter(insertSitter: InsertSitter): Promise<PetSitter> {
    const [sitter] = await db
      .insert(petSitters)
      .values(insertSitter)
      .returning();
    return sitter;
  }

  // Pet Services
  async getAllServices(): Promise<PetService[]> {
    return await db.select().from(petServices);
  }

  async getService(id: string): Promise<PetService | undefined> {
    const [service] = await db.select().from(petServices).where(eq(petServices.id, id));
    return service || undefined;
  }

  async createService(insertService: InsertService): Promise<PetService> {
    const [service] = await db
      .insert(petServices)
      .values(insertService)
      .returning();
    return service;
  }

  // Social Posts
  async getAllPosts(): Promise<SocialPost[]> {
    return await db.select().from(socialPosts).orderBy(socialPosts.createdAt);
  }

  async getPost(id: string): Promise<SocialPost | undefined> {
    const [post] = await db.select().from(socialPosts).where(eq(socialPosts.id, id));
    return post || undefined;
  }

  async createPost(insertPost: InsertSocialPost): Promise<SocialPost> {
    const [post] = await db
      .insert(socialPosts)
      .values(insertPost)
      .returning();
    return post;
  }

  async updatePost(id: string, updateData: Partial<InsertSocialPost>): Promise<SocialPost | undefined> {
    const [post] = await db
      .update(socialPosts)
      .set(updateData)
      .where(eq(socialPosts.id, id))
      .returning();
    return post || undefined;
  }

  async deletePost(id: string): Promise<boolean> {
    const result = await db.delete(socialPosts).where(eq(socialPosts.id, id));
    return (result.rowCount || 0) > 0;
  }

  // Comments
  async getCommentsByPostId(postId: string): Promise<PostComment[]> {
    return await db.select().from(postComments).where(eq(postComments.postId, postId));
  }

  async createComment(insertComment: InsertComment): Promise<PostComment> {
    const [comment] = await db
      .insert(postComments)
      .values(insertComment)
      .returning();
    return comment;
  }

  // Likes
  async getLikesByPostId(postId: string): Promise<PostLike[]> {
    return await db.select().from(postLikes).where(eq(postLikes.postId, postId));
  }

  async createLike(insertLike: InsertLike): Promise<PostLike> {
    const [like] = await db
      .insert(postLikes)
      .values(insertLike)
      .returning();
    return like;
  }

  async deleteLike(postId: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(postLikes)
      .where(eq(postLikes.postId, postId));
    return (result.rowCount || 0) > 0;
  }
}

export const storage = new DatabaseStorage();
