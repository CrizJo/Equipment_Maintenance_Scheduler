import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { canCompleteRecord } from "../middleware/role.js";
import { completeMaintenance, refreshOverdue } from "../services/maintenance.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await refreshOverdue();

    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.type) where.type = req.query.type;
    if (req.query.equipmentId) where.equipmentId = Number(req.query.equipmentId);

    if (req.query.upcoming === "true") {
      where.status = { in: ["scheduled", "in_progress", "overdue"] };
    }
    if (req.query.past === "true") {
      where.status = "completed";
    }

    if (req.role === "Technician" && req.technicianName) {
      where.assignedTo = req.technicianName;
    }

    const items = await prisma.maintenanceRecord.findMany({
      where,
      include: { equipment: true },
      orderBy: { scheduledDate: req.query.past === "true" ? "desc" : "asc" },
    });

    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load maintenance records" });
  }
});

router.patch("/:id/complete", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const record = await prisma.maintenanceRecord.findUnique({ where: { id } });
    if (!record) return res.status(404).json({ error: "Maintenance record not found" });

    if (!canCompleteRecord(req, record)) {
      return res.status(403).json({
        error: "Technicians can only complete tasks assigned to them.",
      });
    }

    const updated = await completeMaintenance(id, {
      completionNotes: req.body?.completionNotes,
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({ error: error.message || "Failed to complete task" });
  }
});

export default router;
