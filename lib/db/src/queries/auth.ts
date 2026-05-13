import type { DB } from '../workers-db';

export async function loginUser(db: DB, email: string, password: string) {
  const result = await db.execute(
    'SELECT id, email, full_name AS "fullName", role FROM users WHERE email = $1 AND password = $2',
    [email, password],
  );
  if (result.rows?.length === 0) throw new Error('Invalid email or password');
  const user = result.rows[0];
  return { user, token: Buffer.from(JSON.stringify(user)).toString('base64') };
}
