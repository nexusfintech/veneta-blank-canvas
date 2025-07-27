import { type Client, type InsertClient } from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private clients: Map<string, Client>;

  constructor() {
    this.clients = new Map();
    this.seedData();
  }

  private seedData() {
    const sampleClients: Client[] = [
      {
        id: "1",
        type: "persona_fisica",
        firstName: "Mario",
        lastName: "Bianchi",
        fiscalCode: "BNCMRA85M01H501Z",
        birthDate: "1985-08-01",
        email: "mario.bianchi@email.com",
        phone: "+39 335 123 4567",
        address: "Via Roma 123",
        zipCode: "20100",
        city: "Milano",
        province: "MI",
        status: "attivo",
        companyName: null,
        vatNumber: null,
        companyFiscalCode: null,
        notes: null,
      },
      {
        id: "2",
        type: "azienda",
        companyName: "Rossi Construction SRL",
        vatNumber: "IT12345678901",
        companyFiscalCode: "12345678901",
        email: "info@rossiconstruction.it",
        phone: "+39 02 123 4567",
        address: "Via Nazionale 456",
        zipCode: "00100",
        city: "Roma",
        province: "RM",
        status: "attivo",
        firstName: null,
        lastName: null,
        fiscalCode: null,
        birthDate: null,
        notes: null,
      },
      {
        id: "3",
        type: "persona_fisica",
        firstName: "Laura",
        lastName: "Verdi",
        fiscalCode: "VRDLRA90A41F205X",
        birthDate: "1990-01-01",
        email: "laura.verdi@email.com",
        phone: "+39 347 987 6543",
        address: "Corso Umberto 789",
        zipCode: "80100",
        city: "Napoli",
        province: "NA",
        status: "inattivo",
        companyName: null,
        vatNumber: null,
        companyFiscalCode: null,
        notes: null,
      },
    ];

    sampleClients.forEach(client => {
      this.clients.set(client.id, client);
    });
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getAllClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async searchClients(query: string): Promise<Client[]> {
    if (!query.trim()) {
      return this.getAllClients();
    }

    const searchTerm = query.toLowerCase();
    return Array.from(this.clients.values()).filter(client => {
      const searchableFields = [
        client.firstName,
        client.lastName,
        client.companyName,
        client.fiscalCode,
        client.vatNumber,
        client.email,
        client.phone,
        client.city,
      ].filter(Boolean);

      return searchableFields.some(field => 
        field?.toLowerCase().includes(searchTerm)
      );
    });
  }

  async filterClients(filters: { type?: string; status?: string }): Promise<Client[]> {
    let results = Array.from(this.clients.values());

    if (filters.type) {
      results = results.filter(client => client.type === filters.type);
    }

    if (filters.status) {
      results = results.filter(client => client.status === filters.status);
    }

    return results;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = randomUUID();
    const client: Client = { 
      ...insertClient, 
      id,
      type: insertClient.type,
      status: insertClient.status || "attivo",
      // Ensure all nullable fields are properly typed
      address: insertClient.address ?? null,
      email: insertClient.email ?? null,
      phone: insertClient.phone ?? null,
      firstName: insertClient.firstName ?? null,
      lastName: insertClient.lastName ?? null,
      fiscalCode: insertClient.fiscalCode ?? null,
      birthDate: insertClient.birthDate ?? null,
      companyName: insertClient.companyName ?? null,
      vatNumber: insertClient.vatNumber ?? null,
      companyFiscalCode: insertClient.companyFiscalCode ?? null,
      zipCode: insertClient.zipCode ?? null,
      city: insertClient.city ?? null,
      province: insertClient.province ?? null,
      notes: insertClient.notes ?? null
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: string, updateData: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) {
      return undefined;
    }

    const updatedClient: Client = { ...existingClient, ...updateData };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: string): Promise<boolean> {
    return this.clients.delete(id);
  }

  async getStats(): Promise<{
    totalClients: number;
    individuals: number;
    companies: number;
    activeContracts: number;
  }> {
    const allClients = Array.from(this.clients.values());
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

export const storage = new MemStorage();
