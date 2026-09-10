export const TASK_STATUS_STYLES = {
  scheduled: "bg-blue-50 text-blue-700",
  in_progress: "bg-indigo-50 text-indigo-700",
  overdue: "bg-red-50 text-red-700",
  completed: "bg-emerald-50 text-emerald-700",
};

export const TASK_DOT_STYLES = {
  scheduled: "bg-blue-500",
  in_progress: "bg-indigo-500",
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
