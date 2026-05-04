import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import agentsRouter from "./agents";
import inspectionsRouter from "./inspections";
import salesLogsRouter from "./salesLogs";
import ticketsRouter from "./tickets";
import inventoryRouter from "./inventory";
import scoresRouter from "./scores";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import agentRequestsRouter from "./agentRequests";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(agentsRouter);
router.use(inspectionsRouter);
router.use(salesLogsRouter);
router.use(ticketsRouter);
router.use(inventoryRouter);
router.use(scoresRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(agentRequestsRouter);

export default router;
