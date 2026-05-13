// =====================================================
//  LTT Database - Netlify Serverless Connection
//  يستخدم @neondatabase/serverless المتوافق مع
//  Netlify Functions (serverless)
// =====================================================

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

let db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (db) return db;

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not configured.\n' +
      'قم بتعيين DATABASE_URL في Netlify Environment Variables.',
    );
  }

  const sql = neon(databaseUrl);
  db = drizzle(sql, { logger: false });

  return db;
}

export async function testConnection(): Promise<{
  connected: boolean;
  error?: string;
  timestamp?: string;
}> {
  try {
    const client = getDb();
    const result = await client.execute('SELECT NOW() as now');
    return {
      connected: true,
      timestamp: result.rows?.[0]?.now || new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('[DB] Connection test failed:', err.message);
    return { connected: false, error: err.message };
  }
}

export async function executeQuery<T>(
  queryFn: () => Promise<T>,
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await queryFn();
    return { data };
  } catch (err: any) {
    console.error('[DB] Query failed:', err.message);
    return { error: err.message };
  }
}

export function resetConnection() {
  db = null;
}
