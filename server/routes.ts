import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import multer from "multer";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import * as XLSX from "xlsx";
import { storage } from "./storage";
import { insertClientSchema, loginSchema, type User } from "@shared/schema";
import { extractCompanyDataFromText } from "./openai";
import { z } from "zod";

// Extend Express session type
declare module "express-session" {
  interface SessionData {
    userId?: string;
    user?: User;
  }
}

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Admin middleware
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await storage.getUser(req.session.userId!);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error checking admin status" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Multer configuration for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "application/pdf" || 
          file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.mimetype === "application/vnd.ms-excel") {
        cb(null, true);
      } else {
        cb(new Error("Only PDF and Excel files are allowed"));
      }
    },
  });

  // Session configuration
  const pgStore = connectPg(session);
  app.use(session({
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: false,
      tableName: "sessions",
    }),
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(credentials);
      
      if (!user) {
        return res.status(401).json({ message: "Email o password non corretti" });
      }

      req.session.userId = user.id;
      req.session.user = user;
      
      res.json({ message: "Login successful", user: { ...user, password: undefined } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dati non validi", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Errore interno del server" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Errore durante il logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "User not found" });
      }

      res.json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Get all clients (protected route - admin can see all, users see only their own)
  app.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const { search, type, status } = req.query;
      const userRole = req.session.user?.role;
      const userId = req.session.userId;

      let clients;
      if (search) {
        clients = await storage.searchClients(search as string);
      } else {
        clients = await storage.getAllClients();
      }

      // Apply filters
      if (type || status) {
        clients = await storage.filterClients({
          type: type as string,
          status: status as string,
        });
      }

      // If user is not admin, show only their own clients and hide contact information
      if (userRole !== "admin") {
        clients = clients
          .filter(client => client.createdBy === userId)
          .map(client => ({
            ...client,
            email: undefined,
            phone: undefined,
            address: undefined,
            zipCode: undefined,
            city: undefined,
            province: undefined,
            legalAddress: undefined,
            legalZipCode: undefined,
            legalCity: undefined,
            legalProvince: undefined,
            fax: undefined,
            pec: undefined,
          }));
      } else {
        // Admin can see all clients, add creator information
        const clientsWithCreator = await Promise.all(
          clients.map(async (client) => {
            const creator = client.createdBy ? await storage.getUser(client.createdBy) : null;
            return {
              ...client,
              creatorName: creator ? `${creator.firstName} ${creator.lastName}` : "Unknown",
              creatorEmail: creator?.email || "",
            };
          })
        );
        clients = clientsWithCreator;
      }

      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  // Get client by ID (protected route - admin can see all, users see only their own)
  app.get("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      const userRole = req.session.user?.role;
      const userId = req.session.userId;
      
      // If user is not admin, check if they own this client and hide contact information
      if (userRole !== "admin") {
        if (client.createdBy !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
        
        const limitedClient = {
          ...client,
          email: undefined,
          phone: undefined,
          address: undefined,
          zipCode: undefined,
          city: undefined,
          province: undefined,
          legalAddress: undefined,
          legalZipCode: undefined,
          legalCity: undefined,
          legalProvince: undefined,
          fax: undefined,
          pec: undefined,
        };
        return res.json(limitedClient);
      }

      // Admin can see all clients with creator info
      const creator = client.createdBy ? await storage.getUser(client.createdBy) : null;
      const clientWithCreator = {
        ...client,
        creatorName: creator ? `${creator.firstName} ${creator.lastName}` : "Unknown",
        creatorEmail: creator?.email || "",
      };

      res.json(clientWithCreator);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  // Create new client (protected route)
  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      // Add the current user as the creator
      const clientData = {
        ...validatedData,
        createdBy: req.session.userId,
      };
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  // Update client (protected route)
  app.put("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, validatedData);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  // Delete client (protected route)
  app.delete("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteClient(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json({ message: "Client deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Get stats (protected route)
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // PDF upload and data extraction endpoint
  app.post("/api/extract-pdf", requireAuth, upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF file provided" });
      }

      // Extract text from PDF using pdfjs-dist
      const pdfData = new Uint8Array(req.file.buffer);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      
      let extractedText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        extractedText += pageText + "\n";
      }

      if (!extractedText.trim()) {
        return res.status(400).json({ message: "Could not extract text from PDF" });
      }

      // Use OpenAI to extract company data
      const extractedData = await extractCompanyDataFromText(extractedText);

      res.json({
        message: "Data extracted successfully",
        data: extractedData,
        extractedText: extractedText.substring(0, 1000) + "..." // First 1000 chars for debugging
      });
    } catch (error) {
      console.error("PDF extraction error:", error);
      res.status(500).json({ 
        message: "Failed to extract data from PDF",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Excel import endpoint
  app.post("/api/import-excel", requireAuth, upload.single("excel"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No Excel file provided" });
      }

      // Parse Excel file
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        return res.status(400).json({ message: "No data found in Excel file" });
      }

      const userId = (req.user as any).id;
      const importedClients = [];
      const errors = [];

      // Process each row
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        
        try {
          // Map Excel columns to client fields - adjust these based on your Excel structure
          const clientData = {
            type: row.Tipo?.toLowerCase() === 'azienda' ? 'azienda' : 'persona_fisica',
            firstName: row.Nome || row.nome || '',
            lastName: row.Cognome || row.cognome || '',
            companyName: row.Azienda || row.azienda || row['Ragione Sociale'] || '',
            fiscalCode: row['Codice Fiscale'] || row.codiceFiscale || '',
            vatNumber: row['Partita IVA'] || row.partitaIVA || row.piva || '',
            email: row.Email || row.email || '',
            phone: row.Telefono || row.telefono || row.cellulare || '',
            address: row.Indirizzo || row.indirizzo || '',
            city: row.Citta || row.città || row.comune || '',
            zipCode: row.CAP || row.cap || '',
            province: row.Provincia || row.provincia || '',
            notes: row.Note || row.note || '',
            status: 'attivo',
            ownerId: userId
          };

          // Validate required fields
          if (clientData.type === 'persona_fisica' && (!clientData.firstName || !clientData.lastName)) {
            errors.push(`Riga ${i + 1}: Nome e Cognome richiesti per persona fisica`);
            continue;
          }
          
          if (clientData.type === 'azienda' && !clientData.companyName) {
            errors.push(`Riga ${i + 1}: Ragione Sociale richiesta per azienda`);
            continue;
          }

          // Create client
          const newClient = await storage.createClient(clientData);
          importedClients.push(newClient);

        } catch (error) {
          errors.push(`Riga ${i + 1}: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
        }
      }

      res.json({
        message: `Importazione completata. ${importedClients.length} clienti importati.`,
        imported: importedClients.length,
        errors: errors.length,
        errorDetails: errors
      });

    } catch (error) {
      console.error("Excel import error:", error);
      res.status(500).json({ 
        message: "Failed to import Excel file",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Admin-only routes for user management
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Don't send passwords in response
      const safeUsers = users.map(user => ({ ...user, password: undefined }));
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userData = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Un utente con questa email esiste già" });
      }

      const user = await storage.createUser(userData);
      res.status(201).json({ ...user, password: undefined });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Prevent admin from deleting themselves
      if (userId === req.session.userId) {
        return res.status(400).json({ message: "Non puoi eliminare il tuo stesso account" });
      }

      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
