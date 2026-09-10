import { startOfDay } from "date-fns";
import { prisma } from "../lib/prisma.js";
import { calculateNextDate, withEquipmentFlags } from "./interval.js";

export async function refreshOverdue() {
  const today = startOfDay(new Date());
  await prisma.maintenanceRecord.updateMany({
    where: {
      status: "scheduled",
      scheduledDate: { lt: today },
    },
    data: { status: "overdue" },
  });
}

export function serializeEquipment(equipment) {
  const { records, ...rest } = equipment;
  const serialized = withEquipmentFlags(rest);
  if (records) serialized.records = records;
  return serialized;
}

export async function completeMaintenance(id, { completionNotes } = {}) {
  const record = await prisma.maintenanceRecord.findUnique({
    where: { id },
    include: { equipment: true },
  });

  if (!record) {
    const error = new Error("Maintenance record not found");
    error.status = 404;
    throw error;
  }

  if (record.status === "completed") {
    const error = new Error("This task is already completed");
    error.status = 400;
    throw error;
  }

  const completedDate = startOfDay(new Date());

  const updated = await prisma.$transaction(async (tx) => {
    const completed = await tx.maintenanceRecord.update({
      where: { id },
      data: {
        status: "completed",
        completedDate,
        completionNotes: completionNotes || null,
      },
      include: { equipment: true },
    });

    if (record.equipment.fixedInterval) {
      const nextDate = calculateNextDate(completedDate, record.equipment);

      await tx.equipment.update({
        where: { id: record.equipmentId },
        data: {
          nextMaintenanceDate: nextDate,
          status:
            record.equipment.status === "under_maintenance"
              ? "operational"
              : record.equipment.status,
        },
      });

      await tx.maintenanceRecord.create({
        data: {
          equipmentId: record.equipmentId,
          type: record.type,
          description: record.description,
          assignedTo: record.equipment.assignedTechnician,
          scheduledDate: nextDate,
          status: "scheduled",
        },
      });
    }

    return completed;
  });

  return updated;
}
