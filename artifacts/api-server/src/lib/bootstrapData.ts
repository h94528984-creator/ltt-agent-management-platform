import { pool } from "@workspace/db";
import { logger } from "./logger";
// @ts-expect-error - .sql files are bundled as text by esbuild
import seedSql from "../seed-snapshot.sql";

const TABLES = [
  "document_history",
  "agent_documents",
  "notifications",
  "agent_scores",
  "sales_logs",
  "inspections",
  "tickets",
  "inventory",
  "agent_requests",
  "agents",
  "users",
];

export async function bootstrapDataIfEmpty(): Promise<void> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query<{ count: string }>(
      "SELECT COUNT(*)::text AS count FROM users",
    );
    const userCount = Number(rows[0]?.count ?? 0);

    if (userCount > 0) {
      logger.info(
        { userCount },
        "Database already has data; skipping bootstrap seed",
      );
      return;
    }

    logger.warn(
      "Database is empty — bootstrapping from embedded snapshot (production seed)",
    );

    const cleanedSql = (seedSql as string)
      .split("\n")
      .filter((line) => !line.startsWith("\\"))
      .join("\n");

    await client.query("BEGIN");
    for (const t of TABLES) {
      await client.query(`TRUNCATE TABLE ${t} RESTART IDENTITY CASCADE`);
    }
    await client.query(cleanedSql);
    await client.query("COMMIT");

    const after = await client.query<{
      agents: string;
      reqs: string;
      users: string;
    }>(
      "SELECT (SELECT COUNT(*)::text FROM agents) AS agents, (SELECT COUNT(*)::text FROM agent_requests) AS reqs, (SELECT COUNT(*)::text FROM users) AS users",
    );
    logger.info({ counts: after.rows[0] }, "Bootstrap seed applied");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    logger.error({ err }, "Bootstrap seed failed");
  } finally {
    client.release();
  }
}
