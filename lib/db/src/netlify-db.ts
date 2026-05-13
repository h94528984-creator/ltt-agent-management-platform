// =====================================================
//  LTT Database - Netlify Serverless Connection
//  يستخدم @neondatabase/serverless المتوافق مع
//  Netlify Functions (serverless)
// =====================================================
//  DATABASE_URL يجب أن يكون معرفاً في Environment Variables
//  في Netlify Dashboard أو عبر ملف .env للتطوير المحلي
// =====================================================

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let db: ReturnType<typeof drizzle> | null = null;

/**
 * الحصول على اتصال قاعدة البيانات
 * يستخدم Singleton pattern لتجنب إنشاء اتصالات متعددة
 * في بيئة Netlify Serverless (كل استدعاء قد يكون من instance جديد)
 */
export function getDb() {
  if (db) return db;

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not configured.\n' +
      'قم بتعيين DATABASE_URL في Netlify Environment Variables:\n' +
      '  Netlify Dashboard → Site Settings → Environment Variables\n' +
      '  أو استخدم: netlify env:set DATABASE_URL "postgresql://..."',
    );
  }

  const sql = neon(databaseUrl);
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
 * إعادة تعيين اتصال قاعدة البيانات (للتطوير والاختبار)
 */
export function resetConnection() {
  db = null;
}
