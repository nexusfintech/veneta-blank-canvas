import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, boolean, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Legal representative data structure
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
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  documentAuthority: z.string().optional(),
  documentIssuePlace: z.string().optional(),
  documentIssueDate: z.string().optional(),
  isPoliticallyExposed: z.boolean().default(false),
  benefitsPublicFunds: z.boolean().default(false),
  hasApicalRoles: z.boolean().default(false),
  hasPublicCharges: z.boolean().default(false),
  hasCriminalRecord: z.boolean().default(false),
});

// Beneficial owner data structure
export const beneficialOwnerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  birthPlace: z.string().optional(),
  birthDate: z.string().optional(),
  residenceAddress: z.string().optional(),
  residenceZipCode: z.string().optional(),
  residenceCity: z.string().optional(),
  residenceProvince: z.string().optional(),
  documentType: z.string().optional(),
  documentNumber: z.string().optional(),
  documentAuthority: z.string().optional(),
  documentIssuePlace: z.string().optional(),
  documentIssueDate: z.string().optional(),
  isPoliticallyExposed: z.boolean().default(false),
  hasPublicCharges: z.boolean().default(false),
  hasOtherRoles: z.boolean().default(false),
  benefitsPublicFunds: z.boolean().default(false),
  ownershipReason: z.string().optional(), // ">25%", "<25%", etc.
});

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'persona_fisica' or 'azienda'
  
  // Individual fields
  firstName: text("first_name"),
  lastName: text("last_name"),
  fiscalCode: text("fiscal_code"),
  birthDate: date("birth_date"),
  
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
  
  status: text("status").notNull().default("attivo"), // 'attivo' or 'inattivo'
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
