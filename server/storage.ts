import { type Client, type InsertClient, clients, type User, type InsertUser, type LoginData, users } from "@shared/schema";
import { db } from "./db";
import { eq, or, ilike } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Client operations
  getClient(id: string): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  searchClients(query: string): Promise<Client[]>;
  filterClients(filters: { type?: string; status?: string }): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;
  getStats(): Promise<{
    totalClients: number;
    individuals: number;
    companies: number;
    activeContracts: number;
  }>;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  authenticateUser(credentials: LoginData): Promise<User | null>;
}

export class DatabaseStorage implements IStorage {
  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getAllClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async searchClients(query: string): Promise<Client[]> {
    if (!query.trim()) {
      return this.getAllClients();
    }

    const searchTerm = `%${query}%`;
    return await db.select().from(clients).where(
      or(
        ilike(clients.firstName, searchTerm),
        ilike(clients.lastName, searchTerm),
        ilike(clients.companyName, searchTerm),
        ilike(clients.fiscalCode, searchTerm),
        ilike(clients.vatNumber, searchTerm),
        ilike(clients.email, searchTerm),
        ilike(clients.phone, searchTerm),
        ilike(clients.city, searchTerm)
      )
    );
  }

  async filterClients(filters: { type?: string; status?: string }): Promise<Client[]> {
    const conditions = [];
    if (filters.type) {
      conditions.push(eq(clients.type, filters.type));
    }
    if (filters.status) {
      conditions.push(eq(clients.status, filters.status));
    }

    if (conditions.length > 0) {
      return await db.select().from(clients).where(conditions.length === 1 ? conditions[0] : or(...conditions));
    }

    return await db.select().from(clients);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: string, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updateData)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getStats(): Promise<{
    totalClients: number;
    individuals: number;
    companies: number;
    activeContracts: number;
  }> {
    const allClients = await db.select().from(clients);
    const individuals = allClients.filter(c => c.type === "persona_fisica").length;
    const companies = allClients.filter(c => c.type === "azienda").length;
    const activeClients = allClients.filter(c => c.status === "attivo").length;

    return {
      totalClients: allClients.length,
      individuals,
      companies,
      activeContracts: Math.floor(activeClients * 0.6), // Rough estimate
    };
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(userData: InsertUser): Promise<User> {
    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async authenticateUser(credentials: LoginData): Promise<User | null> {
    const user = await this.getUserByEmail(credentials.email);
    
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    
    if (!isValidPassword) {
      return null;
    }

    return user;
  }
}

export const storage = new DatabaseStorage();
