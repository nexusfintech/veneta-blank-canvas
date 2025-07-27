import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const clients = pgTable("clients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'persona_fisica' or 'azienda'
  
  // Individual fields
  firstName: text("first_name"),
  lastName: text("last_name"),
  fiscalCode: text("fiscal_code"),
  birthDate: date("birth_date"),
  
  // Company fields
  companyName: text("company_name"),
  vatNumber: text("vat_number"),
  companyFiscalCode: text("company_fiscal_code"),
  
  // Common contact fields
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  zipCode: text("zip_code"),
  city: text("city"),
  province: text("province"),
  notes: text("notes"),
  
  status: text("status").notNull().default("attivo"), // 'attivo' or 'inattivo'
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
});

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
