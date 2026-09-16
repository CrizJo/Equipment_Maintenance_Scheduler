export const TASK_STATUS_STYLES = {
  scheduled: "bg-blue-50 text-blue-700",
  overdue: "bg-red-50 text-red-700",
  completed: "bg-emerald-50 text-emerald-700",
};

export const TASK_DOT_STYLES = {
  scheduled: "bg-blue-500",
  overdue: "bg-red-500",
  completed: "bg-emerald-500",
};

export const TYPE_STYLES = {
  preventive: "bg-blue-50 text-blue-700",
  corrective: "bg-amber-50 text-amber-700",
  inspection: "bg-violet-50 text-violet-700",
};

export function statusLabel(status) {
  return String(status || "").replaceAll("_", " ");
}

export function canCompleteTask(role, technicianName, record) {
  if (!record || record.status === "completed") return false;
  if (role === "Admin" || role === "Manager") return true;
  return (
    role === "Technician" &&
    technicianName &&
    record.assignedTo.toLowerCase() === technicianName.toLowerCase()
  );
}

const OPEN_TASK_STATUSES = ["scheduled", "overdue"];

export function openMaintenanceRecord(item) {
  return (item?.records || []).find((record) => OPEN_TASK_STATUSES.includes(record.status)) || null;
}

export function canCompleteEquipment(role, technicianName, item) {
  if (!item || item.status === "retired") return false;
  const open = openMaintenanceRecord(item);
  if (open) return canCompleteTask(role, technicianName, open);
  if (item.status !== "out_of_service" && item.status !== "under_maintenance") return false;
  if (role === "Admin" || role === "Manager") return true;
  return (
    role === "Technician" &&
    technicianName &&
    item.assignedTechnician?.toLowerCase() === technicianName.toLowerCase()
  );
}

export function canShowCompleteService(role, technicianName, item) {
  if (!canCompleteEquipment(role, technicianName, item)) return false;
  if (item.status === "out_of_service" || item.status === "under_maintenance") return true;
  return role === "Technician";
}

export function serviceTaskFromEquipment(item) {
  const open = openMaintenanceRecord(item);
  if (open) return { ...open, equipment: item };
  return {
    id: `equipment-${item.id}`,
    status: "scheduled",
    assignedTo: item.assignedTechnician,
    description: item.notes || `Complete service and return ${item.name} to operational status.`,
    scheduledDate: item.nextMaintenanceDate || new Date().toISOString(),
    type: "corrective",
    equipment: item,
  };
}
