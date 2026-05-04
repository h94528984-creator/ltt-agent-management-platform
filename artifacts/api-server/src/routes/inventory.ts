import { Router, type IRouter } from "express";
import { db, inventoryTable } from "@workspace/db";
import { eq, and, lte, type SQL } from "drizzle-orm";
import {
  CreateInventoryItemBody,
  UpdateInventoryItemBody,
  GetInventoryItemParams,
  UpdateInventoryItemParams,
  ListInventoryQueryParams,
  RecordInventoryMovementBody,
  RecordInventoryMovementParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/inventory", async (req, res): Promise<void> => {
  const params = ListInventoryQueryParams.safeParse(req.query);
  const conditions: SQL[] = [];
  if (params.success) {
    if (params.data.category) conditions.push(eq(inventoryTable.category, params.data.category));
    if (params.data.lowStock) conditions.push(lte(inventoryTable.quantity, inventoryTable.minQuantity));
  }
  const items = conditions.length > 0
    ? await db.select().from(inventoryTable).where(and(...conditions)).orderBy(inventoryTable.createdAt)
    : await db.select().from(inventoryTable).orderBy(inventoryTable.createdAt);
  res.json(items);
});

router.post("/inventory", async (req, res): Promise<void> => {
  const parsed = CreateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(inventoryTable).values({
    ...parsed.data,
    notes: parsed.data.notes ?? null,
  }).returning();
  res.status(201).json(item);
});

router.get("/inventory/:id", async (req, res): Promise<void> => {
  const params = GetInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, params.data.id));
  if (!item) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }
  res.json(item);
});

router.patch("/inventory/:id", async (req, res): Promise<void> => {
  const params = UpdateInventoryItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.name != null) updateData.name = d.name;
  if (d.category != null) updateData.category = d.category;
  if (d.minQuantity != null) updateData.minQuantity = d.minQuantity;
  if (d.notes !== undefined) updateData.notes = d.notes;
  const [item] = await db.update(inventoryTable).set(updateData).where(eq(inventoryTable.id, params.data.id)).returning();
  if (!item) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }
  res.json(item);
});

router.post("/inventory/:id/movement", async (req, res): Promise<void> => {
  const params = RecordInventoryMovementParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = RecordInventoryMovementBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [current] = await db.select().from(inventoryTable).where(eq(inventoryTable.id, params.data.id));
  if (!current) {
    res.status(404).json({ error: "Inventory item not found" });
    return;
  }
  const delta = parsed.data.type === "in" ? parsed.data.quantity : -parsed.data.quantity;
  const newQty = Math.max(0, current.quantity + delta);
  const [item] = await db.update(inventoryTable)
    .set({ quantity: newQty })
    .where(eq(inventoryTable.id, params.data.id))
    .returning();
  res.json(item);
});

export default router;
