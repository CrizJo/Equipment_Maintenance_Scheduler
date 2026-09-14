import { prisma } from "../lib/prisma.js";
import { nextDueAfterComplete, toDbDate, withEquipmentFlags } from "./interval.js";

export async function refreshOverdue() {
  const today = toDbDate(new Date());
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

function restoredEquipmentStatus(status) {
  if (status === "under_maintenance" || status === "out_of_service") {
    return "operational";
  }
  return status;
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

  const completedDate = toDbDate(new Date());
  const nextStatus = restoredEquipmentStatus(record.equipment.status);

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
      const nextDate = nextDueAfterComplete(record.scheduledDate, completedDate, record.equipment);

      await tx.equipment.update({
        where: { id: record.equipmentId },
        data: {
          nextMaintenanceDate: nextDate,
          status: nextStatus,
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
    } else if (nextStatus !== record.equipment.status) {
      await tx.equipment.update({
        where: { id: record.equipmentId },
        data: { status: nextStatus },
      });
    }

    return completed;
  });

  return updated;
}

export async function completeEquipmentService(id, { completionNotes } = {}) {
  const equipment = await prisma.equipment.findUnique({
    where: { id },
    include: {
      records: {
        where: { status: { in: ["scheduled", "in_progress", "overdue"] } },
        orderBy: { scheduledDate: "asc" },
      },
    },
  });

  if (!equipment) {
    const error = new Error("Equipment not found");
    error.status = 404;
    throw error;
  }

  if (equipment.status === "retired") {
    const error = new Error("Retired equipment cannot be returned to service this way.");
    error.status = 400;
    throw error;
  }

  const open = equipment.records[0];
  if (open) {
    return completeMaintenance(open.id, { completionNotes });
  }

  if (equipment.status !== "out_of_service" && equipment.status !== "under_maintenance") {
    const error = new Error("There is no open maintenance task for this equipment.");
    error.status = 400;
    throw error;
  }

  const completedDate = toDbDate(new Date());

  return prisma.$transaction(async (tx) => {
    const completed = await tx.maintenanceRecord.create({
      data: {
        equipmentId: equipment.id,
        type: "corrective",
        description: `Service completed for ${equipment.name}`,
        assignedTo: equipment.assignedTechnician,
        scheduledDate: completedDate,
        completedDate,
        status: "completed",
        completionNotes: completionNotes || null,
      },
      include: { equipment: true },
    });

    await tx.equipment.update({
      where: { id: equipment.id },
      data: { status: "operational" },
    });

    return completed;
  });
}
