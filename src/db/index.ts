import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// This ensures we don't create multiple connections in development mode
const globalForDb = globalThis as unknown as {
    conn: ReturnType<typeof neon> | undefined;
};

const sql = globalForDb.conn ?? neon(process.env.DATABASE_URL!);

if (process.env.NODE_ENV !== 'production') {
    globalForDb.conn = sql;
}

export const db = drizzle(sql, { schema });
