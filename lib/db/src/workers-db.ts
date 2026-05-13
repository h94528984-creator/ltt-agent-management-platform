import { neon } from '@neondatabase/serverless';

export interface DB {
  execute: (query: string, params?: unknown[]) => Promise<{ rows: any[] }>;
}

export function createDb(env: { DATABASE_URL: string }): DB {
  const databaseUrl = env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL is not configured.\n' +
      'قم بتعيين DATABASE_URL في Cloudflare Environment Variables.',
    );
  }

  const sql = neon(databaseUrl);
  return {
    async execute(query: string, params: unknown[] = []) {
      const rows = await sql.query(query, params as any[]);
      return { rows: rows as any[] };
    },
  };
}
