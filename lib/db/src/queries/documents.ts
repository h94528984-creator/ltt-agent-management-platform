import { getDb } from '../netlify-db';

export async function getDocuments(query?: Record<string, string>) {
  const db = getDb();
  const result = await db.execute('SELECT * FROM agent_documents ORDER BY created_at DESC');
  return result.rows || [];
}

export async function getAgentDocumentStatus() {
  const db = getDb();
  const result = await db.execute(
    `SELECT a.id, a.name,
      CASE
        WHEN COUNT(ad.id) = 0 THEN 'مفقود'
        WHEN COUNT(CASE WHEN ad.expiry_date < NOW() THEN 1 END) > 0 THEN 'منتهي'
        ELSE 'ساري'
      END as doc_status
    FROM agents a
    LEFT JOIN agent_documents ad ON ad.agent_id = a.id
    GROUP BY a.id, a.name`,
  );
  return result.rows || [];
}

export async function createDocument(data: Record<string, unknown>) {
  const db = getDb();
  const result = await db.execute(
    'INSERT INTO agent_documents (agent_id, type, file_url, expiry_date) VALUES ($1, $2, $3, $4) RETURNING *',
    [data.agentId, data.type, data.fileUrl, data.expiryDate],
  );
  return result.rows?.[0];
}
