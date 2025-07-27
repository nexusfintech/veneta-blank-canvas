import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, boolean, decimal, json, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Legal representative data structure (Legale rappresentante o esecutore)
export const legalRepresentativeSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fiscalCode: z.string().optional(),
  birthPlace: z.string().optional(),
  birthDate: z.string().optional(),
  residenceAddress: z.string().optional(),
  residenceZipCode: z.string().optional(),
  residenceCity: z.string().optional(),
  residenceProvince: z.string().optional(),
  documentType: z.string().optional(), // tipo documento
  documentNumber: z.string().optional(), // numero documento
  documentAuthority: z.string().optional(), // autorità rilascio
  documentIssuePlace: z.string().optional(), // luogo rilascio
  documentIssueDate: z.string().optional(), // data rilascio
  isPoliticallyExposed: z.boolean().default(false), // persona politicamente esposta
  benefitsPublicFunds: z.boolean().default(false), // beneficia di fondi pubblici
  hasApicalRoles: z.boolean().default(false), // ruoli apicali in enti che erogano fondi pubblici
  hasPublicCharges: z.boolean().default(false), // importanti cariche pubbliche locali
  hasCriminalRecord: z.boolean().default(false), // condanne/pendenze penali
});

// Beneficial owner data structure (Titolari effettivi)
export const beneficialOwnerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  fiscalCode: z.string().optional(),
  birthPlace: z.string().optional(),
  birthDate: z.string().optional(),
  residenceAddress: z.string().optional(),
  residenceZipCode: z.string().optional(),
  residenceCity: z.string().optional(),
  residenceProvince: z.string().optional(),
  documentType: z.string().optional(), // tipo documento
  documentNumber: z.string().optional(), // numero documento
  documentAuthority: z.string().optional(), // autorità rilascio
  documentIssuePlace: z.string().optional(), // luogo rilascio
  documentIssueDate: z.string().optional(), // data rilascio
  isPoliticallyExposed: z.boolean().default(false), // persona politicamente esposta
  hasPublicCharges: z.boolean().default(false), // cariche pubbliche locali
  hasOtherRoles: z.boolean().default(false), // altre cariche
  benefitsPublicFunds: z.boolean().default(false), // beneficia di fondi pubblici
  ownershipReason: z.string().optional(), // motivazione: ">25%", "<25%", etc.
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'persona_fisica' or 'azienda'
  
  // Individual fields - Dati anagrafici
  firstName: text("first_name"),
  lastName: text("last_name"),
  fiscalCode: text("fiscal_code"),
  birthDate: date("birth_date"),
  gender: text("gender"), // M/F
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
  pec: text("pec"), // Certified email
  
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
  compensationType: text("compensation_type"), // "amount" or "percentage"
  commission: decimal("commission", { precision: 12, scale: 2 }),
  commissionType: text("commission_type"), // "amount" or "percentage"
  instructionFees: decimal("instruction_fees", { precision: 12, scale: 2 }),
  contractDate: date("contract_date"),
  
  // Common contact fields
  email: text("email"),
  phone: text("phone"),
  address: text("address"), // For individuals
  zipCode: text("zip_code"), // For individuals
  city: text("city"), // For individuals
  province: text("province"), // For individuals
  notes: text("notes"),
  
  // Owner/creator of the client record
  createdBy: varchar("created_by").references(() => users.id),
  
  status: text("status").notNull().default("attivo"), // 'attivo' or 'inattivo'
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdBy: true, // This will be set by the server
}).extend({
  legalRepresentative: legalRepresentativeSchema.optional(),
  beneficialOwners: z.array(beneficialOwnerSchema).optional(),
});

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  password: varchar("password").notNull(), // Will store hashed password
  role: varchar("role").notNull().default("user"), // "admin" or "user"
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(1, "Password richiesta"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type LegalRepresentative = z.infer<typeof legalRepresentativeSchema>;
export type BeneficialOwner = z.infer<typeof beneficialOwnerSchema>;
