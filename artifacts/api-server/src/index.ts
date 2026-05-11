import app from "./app";
import { logger } from "./lib/logger";
import { bootstrapDataIfEmpty } from "./lib/bootstrapData";
import { runMonthlyDocumentAlerts } from "./routes/documents";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function start() {
  try {
    await bootstrapDataIfEmpty();
  } catch (err) {
    logger.error({ err }, "Bootstrap step threw; continuing to start server");
  }

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });

  // Recurring monthly document alerts — runs hourly, throttled internally to once/30d per doc
  const ONE_HOUR = 60 * 60 * 1000;
  const triggerAlerts = async () => {
    try {
      const r = await runMonthlyDocumentAlerts();
      if (r.created > 0) logger.info({ created: r.created, checked: r.checked }, "Monthly document alerts created");
    } catch (err) {
      logger.error({ err }, "runMonthlyDocumentAlerts failed");
    }
  };
  setTimeout(triggerAlerts, 30_000);
  setInterval(triggerAlerts, ONE_HOUR);
}

start();
