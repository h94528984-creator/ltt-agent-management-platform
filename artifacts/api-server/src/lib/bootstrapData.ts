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

export type ReseedCounts = { agents: string; reqs: string; users: string };

type Client = Awaited<ReturnType<typeof pool.connect>>;

async function applySeed(client: Client): Promise<ReseedCounts> {
  const cleanedSql = (seedSql as string)
    .split("\n")
    .filter((line) => !line.startsWith("\\"))
    .filter((line) => !/^ALTER TABLE .* (DISABLE|ENABLE) TRIGGER ALL;?$/i.test(line.trim()))
    .join("\n");

  await client.query("BEGIN");
  for (const t of TABLES) {
    await client.query(
      `TRUNCATE TABLE public.${t} RESTART IDENTITY CASCADE`,
    );
  }
  await client.query(cleanedSql);
  await client.query("COMMIT");

  const after = await client.query<ReseedCounts>(
    "SELECT (SELECT COUNT(*)::text FROM agents) AS agents, (SELECT COUNT(*)::text FROM agent_requests) AS reqs, (SELECT COUNT(*)::text FROM users) AS users",
  );
  return after.rows[0]!;
}

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
    const counts = await applySeed(client);
    logger.info({ counts }, "Bootstrap seed applied");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    logger.error({ err }, "Bootstrap seed failed");
  } finally {
    client.release();
  }
}

export async function forceReseed(): Promise<ReseedCounts> {
  const client = await pool.connect();
  try {
    logger.warn("Force re-seed requested by admin — wiping & reloading snapshot");
    const counts = await applySeed(client);
    logger.info({ counts }, "Force re-seed completed");
    return counts;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    logger.error({ err }, "Force re-seed failed");
    throw err;
  } finally {
    client.release();
  }
}
