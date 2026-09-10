import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rows = await prisma.equipment.findMany({
      select: { assignedTechnician: true },
      distinct: ["assignedTechnician"],
      orderBy: { assignedTechnician: "asc" },
    });
    res.json(rows.map((row) => row.assignedTechnician));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load technicians" });
  }
});

export default router;
