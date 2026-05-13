import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export type DB = ReturnType<typeof drizzle>;

export function createDb(env: { DATABASE_URL: string }): DB {
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not configured.\n' +
      'قم بتعيين DATABASE_URL في Cloudflare Environment Variables.',
    );
  }

  const sql = neon(databaseUrl);
  return drizzle(sql, { logger: false });
}
