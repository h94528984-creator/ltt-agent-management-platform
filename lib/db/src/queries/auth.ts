import { getDb } from '../netlify-db';

export async function loginUser(email: string, password: string) {
  const db = getDb();
  // TODO: تنفيذ استعلام تسجيل الدخول
  const result = await db.execute(
    'SELECT id, email, full_name AS "fullName", role FROM users WHERE email = $1 AND password = $2',
    [email, password],
  );
  if (result.rows?.length === 0) throw new Error('Invalid email or password');
  const user = result.rows[0];
  return { user, token: Buffer.from(JSON.stringify(user)).toString('base64') };
}
