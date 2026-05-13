import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// =====================================================
//  LTT - Database Production Configuration
//  ضع هذا الملف في lib/db/src/config/
// =====================================================

const poolConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number.parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'ltt_platform',
  user: process.env.DB_USER || 'ltt_admin',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: Number.parseInt(process.env.DB_POOL_MAX || '10', 10),
  min: Number.parseInt(process.env.DB_POOL_MIN || '2', 10),
  idleTimeoutMillis: Number.parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: Number.parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
  application_name: 'ltt-api-server',
};

let pool: Pool;
let db: ReturnType<typeof drizzle>;

export function createDbConnection() {
  pool = new Pool(poolConfig);

  // Handle pool errors to prevent crash
  pool.on('error', (err) => {
    console.error(`[DB Pool] Unexpected error on idle client:`, err.message);
  });

  pool.on('connect', () => {
    console.log(`[DB Pool] New client connected to ${poolConfig.host}:${poolConfig.port}/${poolConfig.database}`);
  });

  pool.on('remove', () => {
    console.log(`[DB Pool] Client removed from pool`);
  });

  db = drizzle(pool, { schema, logger: false });
  return { pool, db };
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call createDbConnection() first.');
  }
  return db;
}

export async function closeDbConnection() {
  if (pool) {
    await pool.end();
    console.log('[DB Pool] All connections closed.');
  }
}

export async function testDbConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as now');
    client.release();
    console.log(`[DB] Connection successful. Server time: ${result.rows[0].now}`);
    return true;
  } catch (err) {
    console.error(`[DB] Connection test failed:`, (err as Error).message);
    return false;
  }
}
