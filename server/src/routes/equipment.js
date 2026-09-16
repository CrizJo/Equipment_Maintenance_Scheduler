import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { canCompleteRecord, requireRoles } from "../middleware/role.js";
import {
  completeEquipmentService,
  refreshOverdue,
  serializeEquipment,
} from "../services/maintenance.js";

const router = Router();

function equipmentWhere(req) {
  if (req.role === "Technician" && req.technicianName) {
    return { assignedTechnician: req.technicianName };
  }
  return {};
}

router.get("/", async (req, res) => {
  try {
    await refreshOverdue();
    const items = await prisma.equipment.findMany({
      where: equipmentWhere(req),
      include: {
        records: {
          where: { status: { in: ["scheduled", "overdue"] } },
          orderBy: { scheduledDate: "asc" },
          take: 3,
        },
      },
      orderBy: { name: "asc" },
    });
    res.json(items.map(serializeEquipment));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load equipment" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await prisma.equipment.findFirst({
      where: { id, ...equipmentWhere(req) },
      include: { records: { orderBy: { scheduledDate: "desc" } } },
    });
    if (!item) return res.status(404).json({ error: "Equipment not found" });
    res.json(serializeEquipment(item));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load equipment" });
  }
});

router.post("/:id/complete-service", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const equipment = await prisma.equipment.findFirst({
      where: { id, ...equipmentWhere(req) },
      include: {
        records: {
          where: { status: { in: ["scheduled", "overdue"] } },
          orderBy: { scheduledDate: "asc" },
          take: 1,
        },
      },
    });
    if (!equipment) return res.status(404).json({ error: "Equipment not found" });

    if (req.role === "Technician") {
      const assigned =
        req.technicianName &&
        equipment.assignedTechnician.toLowerCase() === req.technicianName.toLowerCase();
      if (!assigned) {
        return res.status(403).json({ error: "Technicians can only complete service on their assigned equipment." });
      }
    }

    const open = equipment.records[0];
    if (open && !canCompleteRecord(req, open)) {
      return res.status(403).json({
        error: "Technicians can only complete tasks assigned to them.",
      });
    }

    const updated = await completeEquipmentService(id, {
      completionNotes: req.body?.completionNotes,
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || "Failed to complete service" });
  }
});

router.post("/", requireRoles("Admin", "Manager"), async (req, res) => {
  try {
    const data = bodyToEquipment(req.body);
    const created = await prisma.$transaction(async (tx) => {
      const equipment = await tx.equipment.create({ data });
      if (equipment.nextMaintenanceDate) {
        await tx.maintenanceRecord.create({
          data: {
            equipmentId: equipment.id,
            type: "preventive",
            description: `Scheduled preventive maintenance for ${equipment.name}`,
            assignedTo: equipment.assignedTechnician,
            scheduledDate: equipment.nextMaintenanceDate,
            status: "scheduled",
          },
        });
      }
      return equipment;
    });
    res.status(201).json(serializeEquipment(created));
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Failed to create equipment" });
  }
});

router.put("/:id", requireRoles("Admin", "Manager"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = await prisma.equipment.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Equipment not found" });

    const data = bodyToEquipment(req.body);
    const updated = await prisma.equipment.update({ where: { id }, data });
    res.json(serializeEquipment(updated));
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || "Failed to update equipment" });
  }
});

router.delete("/:id", requireRoles("Admin"), async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.equipment.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Equipment not found" });
  }
});

function bodyToEquipment(body) {
  if (!body?.name?.trim()) throw new Error("Name is required");
  if (!body?.category?.trim()) throw new Error("Category is required");
  if (!body?.location?.trim()) throw new Error("Location is required");
  if (!body?.assignedTechnician?.trim()) throw new Error("Technician name is required");

  return {
    name: body.name.trim(),
    category: body.category.trim(),
    location: body.location.trim(),
    assignedTechnician: body.assignedTechnician.trim(),
    status: body.status || "operational",
    repeatType: body.repeatType || "monthly",
    repeatInterval: body.repeatInterval ?? null,
    repeatUnit: body.repeatUnit ?? null,
    fixedInterval: Boolean(body.fixedInterval),
    nextMaintenanceDate: body.nextMaintenanceDate ? new Date(body.nextMaintenanceDate) : null,
    expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
    notes: body.notes?.trim() || null,
  };
}

export default router;
