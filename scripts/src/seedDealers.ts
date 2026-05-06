import pg from "pg";
import { AGENTS } from "../../artifacts/agent-request-form/src/data/agentsList.ts";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const client = await pool.connect();
  try {
    console.log(`Seeding ${AGENTS.length} real dealers...`);

    await client.query("BEGIN");
    await client.query("DELETE FROM agent_scores");
    await client.query("DELETE FROM sales_logs");
    await client.query("DELETE FROM inspections");
    await client.query("DELETE FROM agents");
    await client.query("ALTER SEQUENCE agents_id_seq RESTART WITH 1");

    let inserted = 0;
    for (const a of AGENTS) {
      await client.query(
        `INSERT INTO agents (name, location, city, address, phone, email, type, status, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, 'dealer', 'active', $7, $8)`,
        [
          a.name.trim(),
          a.city || "غير محدد",
          a.city || null,
          a.address || null,
          a.phone || null,
          a.email || null,
          a.lat,
          a.lng,
        ],
      );
      inserted++;
    }

    const backfill = await client.query(
      `UPDATE agent_requests AS r
       SET agent_id = a.id
       FROM agents a
       WHERE TRIM(LOWER(r.agent_name)) = TRIM(LOWER(a.name))
       RETURNING r.id`,
    );

    await client.query("COMMIT");
    console.log(`✓ Inserted ${inserted} dealers`);
    console.log(`✓ Linked ${backfill.rowCount} historical inspection records to dealers`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
