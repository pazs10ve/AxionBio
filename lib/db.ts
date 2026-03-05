import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/src/db/schema';

// Use pooled URL in production, direct in dev
const connectionString = process.env.DATABASE_URL!;

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
