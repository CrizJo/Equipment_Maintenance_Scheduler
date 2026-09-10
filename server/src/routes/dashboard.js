import { Router } from "express";
import { startOfQuarter } from "date-fns";
import { prisma } from "../lib/prisma.js";
import { refreshOverdue, serializeEquipment } from "../services/maintenance.js";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    await refreshOverdue();

    const [equipment, records] = await Promise.all([
      prisma.equipment.findMany(),
      prisma.maintenanceRecord.findMany({ include: { equipment: true } }),
    ]);

    const byStatus = equipment.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {});

    const byType = records.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    const quarterStart = startOfQuarter(new Date());
    const completedThisQuarter = records.filter(
      (item) => item.status === "completed" && item.completedDate && item.completedDate >= quarterStart
    ).length;

    const flagged = equipment.map(serializeEquipment);

    res.json({
      totalEquipment: equipment.length,
      operational: byStatus.operational || 0,
      scheduledTasks: records.filter((item) => ["scheduled", "in_progress"].includes(item.status)).length,
      inProgress: records.filter((item) => item.status === "in_progress").length,
      overdue: records.filter((item) => item.status === "overdue").length,
      completedThisQuarter,
      statusBreakdown: [
        { name: "Operational", value: byStatus.operational || 0, key: "operational" },
        { name: "Under Maintenance", value: byStatus.under_maintenance || 0, key: "under_maintenance" },
        { name: "Out of Service", value: byStatus.out_of_service || 0, key: "out_of_service" },
        { name: "Retired", value: byStatus.retired || 0, key: "retired" },
      ],
      typeBreakdown: [
        { name: "Preventive", value: byType.preventive || 0, key: "preventive" },
        { name: "Corrective", value: byType.corrective || 0, key: "corrective" },
        { name: "Inspection", value: byType.inspection || 0, key: "inspection" },
      ],
      expiringSoon: flagged.filter((item) => item.isExpiringSoon),
      expired: flagged.filter((item) => item.isExpired),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
});

export default router;
