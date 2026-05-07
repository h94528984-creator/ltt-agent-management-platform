import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword } from "../lib/auth";
import {
  CreateUserBody,
  UpdateUserBody,
  GetUserParams,
  UpdateUserParams,
  DeleteUserParams,
  BulkImportUsersBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/users", async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(users.map(({ passwordHash: _ph, ...u }) => u));
});

router.post("/users", async (req, res): Promise<void> => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { password, ...rest } = parsed.data;
  const [user] = await db.insert(usersTable).values({
    ...rest,
    department: rest.department ?? null,
    passwordHash: hashPassword(password),
  }).returning();
  const { passwordHash: _ph, ...safeUser } = user;
  res.status(201).json(safeUser);
});

router.post("/users/bulk-import", async (req, res): Promise<void> => {
  const parsed = BulkImportUsersBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];
  for (const u of parsed.data.users) {
    try {
      const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, u.email));
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      await db.insert(usersTable).values({
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        department: u.department ?? null,
        passwordHash: hashPassword("LTT@2024"),
      });
      imported++;
    } catch (err) {
      errors.push(`${u.email}: ${String(err)}`);
    }
  }
  res.json({ imported, skipped, errors });
});

router.get("/users/:id", async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { passwordHash: _ph, ...safeUser } = user;
  res.json(safeUser);
});

router.patch("/users/:id", async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  if (parsed.data.fullName != null) updateData.fullName = parsed.data.fullName;
  if (parsed.data.email != null) updateData.email = parsed.data.email;
  if (parsed.data.role != null) updateData.role = parsed.data.role;
  if (parsed.data.department !== undefined) updateData.department = parsed.data.department;
  if (parsed.data.isActive != null) updateData.isActive = parsed.data.isActive;
  const rawPassword = (req.body as { password?: unknown }).password;
  if (typeof rawPassword === "string" && rawPassword.length >= 4) {
    updateData.passwordHash = hashPassword(rawPassword);
  }
  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  const { passwordHash: _ph, ...safeUser } = user;
  res.json(safeUser);
});

router.delete("/users/:id", async (req, res): Promise<void> => {
  const params = DeleteUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.delete(usersTable).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
