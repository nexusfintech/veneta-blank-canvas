import { type Client, type InsertClient, clients } from "@shared/schema";
import { db } from "./db";
import { eq, or, ilike } from "drizzle-orm";

export interface IStorage {
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
}

export const storage = new DatabaseStorage();
