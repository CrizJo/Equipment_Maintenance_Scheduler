import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { serializeEquipment } from "../services/maintenance.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (!q) return res.json({ equipment: [], records: [] });

    const where = {
      OR: [
        { name: { contains: q } },
        { category: { contains: q } },
        { location: { contains: q } },
        { assignedTechnician: { contains: q } },
      ],
    };

    const equipment = await prisma.equipment.findMany({
      where,
      orderBy: { name: "asc" },
    });

    const records = await prisma.maintenanceRecord.findMany({
      where: {
        OR: [
          { description: { contains: q } },
          { assignedTo: { contains: q } },
          { equipment: { name: { contains: q } } },
        ],
      },
      include: { equipment: true },
      orderBy: { scheduledDate: "desc" },
      take: 20,
    });

    res.json({
      equipment: equipment.map(serializeEquipment),
      records,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

export default router;
