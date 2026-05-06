/**
 * One-time seed: imports the 190 real LTT dealers from the inspection form's
 * CSV-derived list into the agents table. Replaces any old fake records.
 *
 * Run: pnpm --filter @workspace/scripts run seed-dealers
 */
import pg from "pg";
import { AGENTS } from "../../artifacts/agent-request-form/src/data/agentsList.ts";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function classifyType(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("شركة البديل") || n.includes("مول")) return "center";
  if (n.includes("شركة")) return "dealer";
  if (n.includes("مركز")) return "center";
  if (n.includes("تشاركية")) return "sub_agent";
  if (n.includes("محل") || n.includes("متجر")) return "dealer";
  if (n.includes("فاضل") || n.includes("موبايل")) return "mobile_seller";
  return "dealer";
}

async function main() {
  const client = await pool.connect();
  try {
    console.log(`Seeding ${AGENTS.length} real dealers...`);

    // Wipe dependent rows first (FK chain). Keep historical agent_requests.
    await client.query("BEGIN");
    await client.query("DELETE FROM agent_scores");
    await client.query("DELETE FROM sales_logs");
    await client.query("DELETE FROM inspections");
    await client.query("DELETE FROM agents");
    await client.query("ALTER SEQUENCE agents_id_seq RESTART WITH 1");

    let inserted = 0;
    for (const a of AGENTS) {
      const type = classifyType(a.name);
      const location = a.city || "غير محدد";
      await client.query(
        `INSERT INTO agents (name, location, city, address, phone, email, type, status, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9)`,
        [
          a.name.trim(),
          location,
          a.city || null,
          a.address || null,
          a.phone || null,
          a.email || null,
          type,
          a.lat,
          a.lng,
        ],
      );
      inserted++;
    }

    // Backfill agent_id on agent_requests by name match
    const backfill = await client.query(
      `UPDATE agent_requests AS r
       SET agent_id = a.id
       FROM agents a
       WHERE r.agent_id IS NULL
         AND TRIM(LOWER(r.agent_name)) = TRIM(LOWER(a.name))
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
