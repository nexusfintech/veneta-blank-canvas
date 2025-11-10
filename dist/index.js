var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import session from "express-session";
import connectPg from "connect-pg-simple";
import multer from "multer";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import * as XLSX from "xlsx";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  beneficialOwnerSchema: () => beneficialOwnerSchema,
  clients: () => clients,
  insertClientSchema: () => insertClientSchema,
  insertUserSchema: () => insertUserSchema,
  legalRepresentativeSchema: () => legalRepresentativeSchema,
  loginSchema: () => loginSchema,
  sessions: () => sessions,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, decimal, json, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var legalRepresentativeSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fiscalCode: z.string().optional(),
  birthPlace: z.string().optional(),
  birthDate: z.string().optional(),
  residenceAddress: z.string().optional(),
  residenceZipCode: z.string().optional(),
  residenceCity: z.string().optional(),
  residenceProvince: z.string().optional(),
  documentType: z.string().optional(),
  // tipo documento
  documentNumber: z.string().optional(),
  // numero documento
  documentAuthority: z.string().optional(),
  // autorità rilascio
  documentIssuePlace: z.string().optional(),
  // luogo rilascio
  documentIssueDate: z.string().optional(),
  // data rilascio
  isPoliticallyExposed: z.boolean().default(false),
  // persona politicamente esposta
  benefitsPublicFunds: z.boolean().default(false),
  // beneficia di fondi pubblici
  hasApicalRoles: z.boolean().default(false),
  // ruoli apicali in enti che erogano fondi pubblici
  hasPublicCharges: z.boolean().default(false),
  // importanti cariche pubbliche locali
  hasCriminalRecord: z.boolean().default(false)
  // condanne/pendenze penali
});
var beneficialOwnerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fiscalCode: z.string().optional(),
  birthPlace: z.string().optional(),
  birthDate: z.string().optional(),
  residenceAddress: z.string().optional(),
  residenceZipCode: z.string().optional(),
  residenceCity: z.string().optional(),
  residenceProvince: z.string().optional(),
  documentType: z.string().optional(),
  // tipo documento
  documentNumber: z.string().optional(),
  // numero documento
  documentAuthority: z.string().optional(),
  // autorità rilascio
  documentIssuePlace: z.string().optional(),
  // luogo rilascio
  documentIssueDate: z.string().optional(),
  // data rilascio
  isPoliticallyExposed: z.boolean().default(false),
  // persona politicamente esposta
  hasPublicCharges: z.boolean().default(false),
  // cariche pubbliche locali
  hasOtherRoles: z.boolean().default(false),
  // altre cariche
  benefitsPublicFunds: z.boolean().default(false),
  // beneficia di fondi pubblici
  ownershipReason: z.string().optional()
  // motivazione: ">25%", "<25%", etc.
});
var clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  // 'persona_fisica' or 'azienda'
  // Individual fields - Dati anagrafici
  firstName: text("first_name"),
  lastName: text("last_name"),
  fiscalCode: text("fiscal_code"),
  birthDate: date("birth_date"),
  gender: text("gender"),
  // M/F
  birthPlace: text("birth_place"),
  citizenship: text("citizenship"),
  // Individual fields - Residenza
  residenceLocality: text("residence_locality"),
  // Individual fields - Documento di identità
  documentType: text("document_type"),
  documentNumber: text("document_number"),
  documentIssuedBy: text("document_issued_by"),
  documentIssuePlace: text("document_issue_place"),
  documentIssueDate: date("document_issue_date"),
  // Company basic fields
  companyName: text("company_name"),
  vatNumber: text("vat_number"),
  companyFiscalCode: text("company_fiscal_code"),
  // Company extended fields - Dati aziendali
  legalAddress: text("legal_address"),
  legalZipCode: text("legal_zip_code"),
  legalCity: text("legal_city"),
  legalProvince: text("legal_province"),
  fax: text("fax"),
  pec: text("pec"),
  // Certified email
  // Legal representative data (JSON)
  legalRepresentative: json("legal_representative"),
  // Beneficial owners data (JSON array)
  beneficialOwners: json("beneficial_owners"),
  // Area geografica e attività
  mainActivityProvince: text("main_activity_province"),
  relationshipDestinationProvince: text("relationship_destination_province"),
  counterpartyAreaProvince: text("counterparty_area_province"),
  professionalActivity: text("professional_activity"),
  // Prodotto richiesto
  requestedProduct: text("requested_product"),
  requestedCapital: decimal("requested_capital", { precision: 12, scale: 2 }),
  financingDuration: text("financing_duration"),
  interestRateType: text("interest_rate_type"),
  // Compenso e oneri
  mediatorCompensation: decimal("mediator_compensation", { precision: 12, scale: 2 }),
  compensationType: text("compensation_type"),
  // "amount" or "percentage"
  commission: decimal("commission", { precision: 12, scale: 2 }),
  commissionType: text("commission_type"),
  // "amount" or "percentage"
  instructionFees: decimal("instruction_fees", { precision: 12, scale: 2 }),
  contractDate: date("contract_date"),
  // Common contact fields
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  // For individuals
  zipCode: text("zip_code"),
  // For individuals
  city: text("city"),
  // For individuals
  province: text("province"),
  // For individuals
  notes: text("notes"),
  // Owner/creator of the client record
  createdBy: varchar("created_by").references(() => users.id),
  status: text("status").notNull().default("attivo")
  // 'attivo' or 'inattivo'
});
var insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdBy: true
  // This will be set by the server
}).extend({
  legalRepresentative: legalRepresentativeSchema.optional(),
  beneficialOwners: z.array(beneficialOwnerSchema).optional()
});
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(),
  // Will store hashed password
  role: varchar("role").notNull().default("user"),
  // "admin" or "user"
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(1, "Password richiesta")
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
import { eq, or, ilike } from "drizzle-orm";
import bcrypt from "bcryptjs";
var DatabaseStorage = class {
  async getClient(id) {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || void 0;
  }
  async getAllClients() {
    return await db.select().from(clients);
  }
  async searchClients(query) {
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
  async filterClients(filters) {
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
  async createClient(insertClient) {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }
  async updateClient(id, updateData) {
    const [client] = await db.update(clients).set(updateData).where(eq(clients.id, id)).returning();
    return client || void 0;
  }
  async deleteClient(id) {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async getStats() {
    const allClients = await db.select().from(clients);
    const individuals = allClients.filter((c) => c.type === "persona_fisica").length;
    const companies = allClients.filter((c) => c.type === "azienda").length;
    const activeClients = allClients.filter((c) => c.status === "attivo").length;
    return {
      totalClients: allClients.length,
      individuals,
      companies,
      activeContracts: Math.floor(activeClients * 0.6)
      // Rough estimate
    };
  }
  // User operations
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async getAllUsers() {
    return await db.select().from(users);
  }
  async createUser(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db.insert(users).values({
      ...userData,
      password: hashedPassword
    }).returning();
    return user;
  }
  async deleteUser(id) {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async authenticateUser(credentials) {
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
};
var storage = new DatabaseStorage();

// server/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
async function extractCompanyDataFromText(text2) {
  try {
    const prompt = `
Analizza il seguente testo di un documento aziendale italiano (probabilmente una visura camerale) ed estrai i seguenti dati in formato JSON.
Se un campo non \xE8 presente o non \xE8 chiaro, non includerlo nel JSON di risposta.

Campi da estrarre:
- companyName: Denominazione/Ragione sociale dell'azienda
- vatNumber: Partita IVA (formato: IT + 11 cifre)
- companyFiscalCode: Codice Fiscale dell'azienda
- legalAddress: Indirizzo della sede legale (via, numero civico)
- legalZipCode: CAP della sede legale
- legalCity: Citt\xE0 della sede legale
- legalProvince: Provincia della sede legale (sigla a 2 lettere)
- phone: Numero di telefono
- email: Indirizzo email
- pec: Indirizzo PEC
- legalRepresentative: Oggetto con i dati del legale rappresentante:
  - firstName: Nome
  - lastName: Cognome
  - fiscalCode: Codice Fiscale
  - birthDate: Data di nascita (formato YYYY-MM-DD)
  - birthPlace: Luogo di nascita

Rispondi SOLO con un oggetto JSON valido, senza commenti o spiegazioni aggiuntive.

Testo da analizzare:
${text2}
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "Sei un esperto nell'estrazione di dati da documenti aziendali italiani. Rispondi sempre con JSON valido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error extracting company data:", error);
    throw new Error("Failed to extract company data from document");
  }
}

// server/routes.ts
import { z as z2 } from "zod";
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}
async function requireAdmin(req, res, next) {
  try {
    const user = await storage.getUser(req.session.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error checking admin status" });
  }
}
async function registerRoutes(app2) {
  app2.get("/", (req, res) => {
    res.status(200).json({
      status: "healthy",
      message: "Client Management System is running",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  app2.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      message: "Client Management System is running",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: "1.0.0"
    });
  });
  app2.get("/health", (req, res) => {
    res.status(200).send("OK");
  });
  app2.get("/ping", (req, res) => {
    res.status(200).send("pong");
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024
      // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "application/pdf" || file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.mimetype === "application/vnd.ms-excel") {
        cb(null, true);
      } else {
        cb(new Error("Only PDF and Excel files are allowed"));
      }
    }
  });
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    // Allow creating table if missing
    tableName: "sessions"
  });
  sessionStore.on("error", (error) => {
    console.error("Session store error:", error);
  });
  app2.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      // Set to false for Replit deployment to work with HTTP
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 hours
      sameSite: "lax"
      // Add sameSite for better compatibility
    }
  }));
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(credentials);
      if (!user) {
        return res.status(401).json({ message: "Email o password non corretti" });
      }
      req.session.userId = user.id;
      req.session.user = user;
      res.json({ message: "Login successful", user: { ...user, password: void 0 } });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Dati non validi",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Errore interno del server" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Errore durante il logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  app2.get("/api/auth/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        req.session.destroy(() => {
        });
        return res.status(401).json({ message: "User not found" });
      }
      res.json({ ...user, password: void 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const { search, type, status } = req.query;
      const userRole = req.session.user?.role;
      const userId = req.session.userId;
      let clients2;
      if (search) {
        clients2 = await storage.searchClients(search);
      } else {
        clients2 = await storage.getAllClients();
      }
      if (type || status) {
        clients2 = await storage.filterClients({
          type,
          status
        });
      }
      if (userRole !== "admin") {
        clients2 = clients2.filter((client) => client.createdBy === userId).map((client) => ({
          ...client,
          email: void 0,
          phone: void 0,
          address: void 0,
          zipCode: void 0,
          city: void 0,
          province: void 0,
          legalAddress: void 0,
          legalZipCode: void 0,
          legalCity: void 0,
          legalProvince: void 0,
          fax: void 0,
          pec: void 0
        }));
      } else {
        const clientsWithCreator = await Promise.all(
          clients2.map(async (client) => {
            const creator = client.createdBy ? await storage.getUser(client.createdBy) : null;
            return {
              ...client,
              creatorName: creator ? `${creator.firstName} ${creator.lastName}` : "Unknown",
              creatorEmail: creator?.email || ""
            };
          })
        );
        clients2 = clientsWithCreator;
      }
      res.json(clients2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });
  app2.get("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const client = await storage.getClient(req.params.id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      const userRole = req.session.user?.role;
      const userId = req.session.userId;
      if (userRole !== "admin") {
        if (client.createdBy !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
        const limitedClient = {
          ...client,
          email: void 0,
          phone: void 0,
          address: void 0,
          zipCode: void 0,
          city: void 0,
          province: void 0,
          legalAddress: void 0,
          legalZipCode: void 0,
          legalCity: void 0,
          legalProvince: void 0,
          fax: void 0,
          pec: void 0
        };
        return res.json(limitedClient);
      }
      const creator = client.createdBy ? await storage.getUser(client.createdBy) : null;
      const clientWithCreator = {
        ...client,
        creatorName: creator ? `${creator.firstName} ${creator.lastName}` : "Unknown",
        creatorEmail: creator?.email || ""
      };
      res.json(clientWithCreator);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });
  app2.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const clientData = {
        ...validatedData,
        createdBy: req.session.userId
      };
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });
  app2.put("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(req.params.id, validatedData);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });
  app2.delete("/api/clients/:id", requireAuth, async (req, res) => {
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
  app2.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  app2.post("/api/extract-pdf", requireAuth, upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No PDF file provided" });
      }
      const pdfData = new Uint8Array(req.file.buffer);
      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      let extractedText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        extractedText += pageText + "\n";
      }
      if (!extractedText.trim()) {
        return res.status(400).json({ message: "Could not extract text from PDF" });
      }
      const extractedData = await extractCompanyDataFromText(extractedText);
      res.json({
        message: "Data extracted successfully",
        data: extractedData,
        extractedText: extractedText.substring(0, 1e3) + "..."
        // First 1000 chars for debugging
      });
    } catch (error) {
      console.error("PDF extraction error:", error);
      res.status(500).json({
        message: "Failed to extract data from PDF",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/import-excel", requireAuth, upload.single("excel"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No Excel file provided" });
      }
      const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      if (jsonData.length === 0) {
        return res.status(400).json({ message: "No data found in Excel file" });
      }
      const userId = req.session.userId;
      const importedClients = [];
      const errors = [];
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        try {
          const clientData = {
            type: row.Tipo?.toLowerCase() === "azienda" ? "azienda" : "persona_fisica",
            firstName: row.Nome || row.nome || "",
            lastName: row.Cognome || row.cognome || "",
            companyName: row.Azienda || row.azienda || row["Ragione Sociale"] || "",
            fiscalCode: row["Codice Fiscale"] || row.codiceFiscale || "",
            vatNumber: row["Partita IVA"] || row.partitaIVA || row.piva || "",
            email: row.Email || row.email || "",
            phone: row.Telefono || row.telefono || row.cellulare || "",
            address: row.Indirizzo || row.indirizzo || "",
            city: row.Citta || row.citt\u00E0 || row.comune || "",
            zipCode: row.CAP || row.cap || "",
            province: row.Provincia || row.provincia || "",
            notes: row.Note || row.note || "",
            status: "attivo",
            ownerId: userId
          };
          if (clientData.type === "persona_fisica" && (!clientData.firstName || !clientData.lastName)) {
            errors.push(`Riga ${i + 1}: Nome e Cognome richiesti per persona fisica`);
            continue;
          }
          if (clientData.type === "azienda" && !clientData.companyName) {
            errors.push(`Riga ${i + 1}: Ragione Sociale richiesta per azienda`);
            continue;
          }
          const newClient = await storage.createClient(clientData);
          importedClients.push(newClient);
        } catch (error) {
          errors.push(`Riga ${i + 1}: ${error instanceof Error ? error.message : "Errore sconosciuto"}`);
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
  app2.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const safeUsers = users2.map((user) => ({ ...user, password: void 0 }));
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userData = req.body;
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Un utente con questa email esiste gi\xE0" });
      }
      const user = await storage.createUser(userData);
      res.status(201).json({ ...user, password: void 0 });
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  app2.delete("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = req.params.id;
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
  const httpServer = createServer(app2);
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

// server/seedUsers.ts
async function seedUsers() {
  console.log("Initializing users...");
  try {
    const adminUser = await storage.getUserByEmail("mauro.frasson@venetagroup.com");
    const normalUser = await storage.getUserByEmail("app@nexusfintech.it");
    if (!adminUser) {
      await storage.createUser({
        email: "mauro.frasson@venetagroup.com",
        password: "Admin123!",
        role: "admin",
        firstName: "Mauro",
        lastName: "Frasson"
      });
      console.log("\u2705 Admin user created: mauro.frasson@venetagroup.com / Admin123!");
    } else {
      console.log("\u2139\uFE0F Admin user already exists");
    }
    if (!normalUser) {
      await storage.createUser({
        email: "app@nexusfintech.it",
        password: "User123!",
        role: "user",
        firstName: "User",
        lastName: "Nexus"
      });
      console.log("\u2705 Normal user created: app@nexusfintech.it / User123!");
    } else {
      console.log("\u2139\uFE0F Normal user already exists");
    }
    console.log("Users initialization completed!");
  } catch (error) {
    console.error("Error seeding users:", error);
  }
}
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUsers().then(() => process.exit(0));
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
async function startServer() {
  try {
    if (process.env.NODE_ENV === "production") {
      log("Initializing database and seeding users...");
      try {
        await seedUsers();
        log("Database initialization completed successfully");
      } catch (error) {
        log(`Warning: Database seeding failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      log(`Error handled: ${status} - ${message}`);
    });
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    const port = parseInt(process.env.PORT || (process.env.NODE_ENV === "production" ? "8080" : "5000"), 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true
    }, () => {
      log(`serving on port ${port}`);
      log("Server is ready to handle requests");
      log(`Health check available at http://0.0.0.0:${port}/api/health`);
    });
    server.on("error", (error) => {
      log(`Server error: ${error.message}`);
      if (error.message.includes("EADDRINUSE")) {
        log(`Port ${port} is already in use. Exiting...`);
        process.exit(1);
      } else {
        log("Server error occurred but continuing...");
      }
    });
    process.on("SIGTERM", () => {
      log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        log("Process terminated");
        process.exit(0);
      });
    });
    process.on("SIGINT", () => {
      log("SIGINT received, shutting down gracefully");
      server.close(() => {
        log("Process terminated");
        process.exit(0);
      });
    });
    process.on("uncaughtException", (error) => {
      log(`Uncaught Exception: ${error.message}`);
      log("Stack trace: " + error.stack);
    });
    process.on("unhandledRejection", (reason, promise) => {
      log(`Unhandled Promise Rejection at: ${promise}, reason: ${reason}`);
    });
    setInterval(() => {
    }, 3e4);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}
startServer();
