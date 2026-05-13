// =====================================================
//  LTT Database - Vercel Serverless Connection
//  يستخدم @neondatabase/serverless المتوافق مع
//  Vercel Edge Functions و Serverless Functions
// =====================================================

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let db: ReturnType<typeof drizzle> | null = null;
let sql: ReturnType<typeof neon> | null = null;

/**
 * الحصول على اتصال قاعدة البيانات
 * يستخدم Singleton pattern لمنع إنشاء اتصالات متعددة
 */
export function getDb() {
  if (db) return db;

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not configured. ' +
        'قم بتعيين DATABASE_URL في Vercel Environment Variables. ' +
        'مثال: postgresql://user:password@ep-example-123456.us-east-2.aws.neon.tech/ltt_platform?sslmode=require',
    );
  }

  sql = neon(databaseUrl);
  db = drizzle(sql, { schema, logger: false });

  return db;
}

/**
 * اختبار الاتصال بقاعدة البيانات
 */
export async function testConnection(): Promise<{
  connected: boolean;
  error?: string;
  timestamp?: string;
}> {
  try {
    const db = getDb();
    const result = await db.execute('SELECT NOW() as now');
    return {
      connected: true,
      timestamp: result.rows?.[0]?.now || new Date().toISOString(),
    };
  } catch (err: any) {
    console.error('[DB] Connection test failed:', err.message);
    return {
      connected: false,
      error: err.message,
    };
  }
}

/**
 * تنفيذ استعلام مع معالجة الأخطاء
 */
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

/**
 * إعادة تعيين اتصال قاعدة البيانات (للاختبار)
 */
export function resetConnection() {
  db = null;
  sql = null;
}
