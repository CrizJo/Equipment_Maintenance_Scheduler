import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireRoles } from "../middleware/role.js";

const router = Router();

function normalizeName(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

async function withStats() {
  const [technicians, equipment, records] = await Promise.all([
    prisma.technician.findMany({ orderBy: { name: "asc" } }),
    prisma.equipment.findMany({ select: { assignedTechnician: true, status: true } }),
    prisma.maintenanceRecord.findMany({
      select: { assignedTo: true, status: true, type: true },
    }),
  ]);

  return technicians.map((person) => {
    const machines = equipment.filter((item) => item.assignedTechnician === person.name);
    const tasks = records.filter((item) => item.assignedTo === person.name);
    return {
      id: person.id,
      name: person.name,
      notes: person.notes || "",
      createdAt: person.createdAt,
      equipmentCount: machines.length,
      operational: machines.filter((item) => item.status === "operational").length,
      openTasks: tasks.filter((item) => item.status !== "completed").length,
      overdue: tasks.filter((item) => item.status === "overdue").length,
      inProgress: tasks.filter((item) => item.status === "in_progress").length,
      completed: tasks.filter((item) => item.status === "completed").length,
    };
  });
}

router.get("/", async (_req, res) => {
  try {
    res.json(await withStats());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load technicians" });
  }
});

router.post("/", requireRoles("Admin", "Manager"), async (req, res) => {
  try {
    const name = normalizeName(req.body?.name);
    const notes = String(req.body?.notes || "").trim() || null;
    if (!name) return res.status(400).json({ error: "Operator name is required." });

    const existing = await prisma.technician.findFirst({
      where: { name: { equals: name } },
    });
    if (existing) return res.status(409).json({ error: "An operator with that name already exists." });

    await prisma.technician.create({ data: { name, notes } });
    res.status(201).json(await withStats());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add operator" });
  }
});

router.put("/:id", requireRoles("Admin", "Manager"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const person = await prisma.technician.findUnique({ where: { id } });
    if (!person) return res.status(404).json({ error: "Operator not found" });

    const name = normalizeName(req.body?.name);
    const notes = String(req.body?.notes ?? person.notes ?? "").trim() || null;
    if (!name) return res.status(400).json({ error: "Operator name is required." });

    const clash = await prisma.technician.findFirst({
      where: { name, NOT: { id } },
    });
    if (clash) return res.status(409).json({ error: "An operator with that name already exists." });

    await prisma.$transaction(async (tx) => {
      await tx.technician.update({ where: { id }, data: { name, notes } });
      if (name !== person.name) {
        await tx.equipment.updateMany({
          where: { assignedTechnician: person.name },
          data: { assignedTechnician: name },
        });
        await tx.maintenanceRecord.updateMany({
          where: { assignedTo: person.name },
          data: { assignedTo: name },
        });
      }
    });

    res.json(await withStats());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update operator" });
  }
});

router.delete("/:id", requireRoles("Admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const person = await prisma.technician.findUnique({ where: { id } });
    if (!person) return res.status(404).json({ error: "Operator not found" });

    const assigned = await prisma.equipment.count({
      where: { assignedTechnician: person.name },
    });
    if (assigned > 0) {
      return res.status(409).json({
        error: `Reassign ${assigned} equipment item${assigned === 1 ? "" : "s"} before deleting this operator.`,
      });
    }

    await prisma.technician.delete({ where: { id } });
    res.json(await withStats());
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete operator" });
  }
});

export default router;
