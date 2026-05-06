import pg from "pg";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const PROD_URL = process.env.PROD_DATABASE_URL;
if (!PROD_URL) {
  console.error("ERROR: PROD_DATABASE_URL must be set.");
  console.error("Get it from Replit → Deployments → your app → Database tab.");
  console.error("Then run:  PROD_DATABASE_URL='postgres://...' pnpm --filter @workspace/scripts run sync-to-prod");
  process.exit(1);
}

const dumpPath = resolve(__dirname, "../seed-data/dev-snapshot.sql");
const sql = readFileSync(dumpPath, "utf8");

const TABLES = [
  "document_history", "agent_documents", "notifications", "agent_scores",
  "sales_logs", "inspections", "tickets", "inventory",
  "agent_requests", "agents", "users",
];

async function main() {
  const pool = new Pool({ connectionString: PROD_URL });
  const client = await pool.connect();
  try {
    console.log("Connected to PRODUCTION database.");

    const before = await client.query(
      "SELECT (SELECT COUNT(*) FROM agents) AS agents, (SELECT COUNT(*) FROM users) AS users, (SELECT COUNT(*) FROM agent_requests) AS reqs",
    );
    console.log("Before:", before.rows[0]);

    console.log("\nTruncating tables (in dependency order)...");
    await client.query("BEGIN");
    for (const t of TABLES) {
      await client.query(`TRUNCATE TABLE ${t} RESTART IDENTITY CASCADE`);
      console.log(`  ✓ truncated ${t}`);
    }

    console.log("\nApplying dev snapshot...");
    await client.query(sql);

    await client.query("COMMIT");

    const after = await client.query(
      "SELECT (SELECT COUNT(*) FROM agents) AS agents, (SELECT COUNT(*) FROM users) AS users, (SELECT COUNT(*) FROM agent_requests) AS reqs",
    );
    console.log("\nAfter: ", after.rows[0]);
    console.log("\n✅ Production database synced successfully.");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("\n❌ Sync failed, rolled back:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
