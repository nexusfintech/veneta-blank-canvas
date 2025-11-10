import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.SUPABASE_DB_URL) {
  throw new Error(
    "SUPABASE_DB_URL must be set. Did you forget to configure Lovable Cloud?",
  );
}

export const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL });
export const db = drizzle({ client: pool, schema });