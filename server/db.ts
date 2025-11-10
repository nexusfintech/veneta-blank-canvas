import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    "Database URL missing. Set SUPABASE_DB_URL (preferred) or DATABASE_URL.",
  );
}

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });