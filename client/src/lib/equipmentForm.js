export function toInputDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export function formatDisplayDate(value) {
  if (!value) return "—";
  return String(value).slice(0, 10);
}

export function emptyEquipmentForm() {
  return {
    name: "",
    category: "Machinery",
    location: "",
    assignedTechnician: "",
    status: "operational",
    repeatType: "monthly",
    repeatInterval: 1,
    repeatUnit: "months",
    fixedInterval: true,
    nextMaintenanceDate: "",
    expiryDate: "",
    notes: "",
  };
}

export function equipmentToForm(item) {
  return {
    name: item.name || "",
    category: item.category || "",
    location: item.location || "",
    assignedTechnician: item.assignedTechnician || "",
    status: item.status || "operational",
    repeatType: item.repeatType || "monthly",
    repeatInterval: item.repeatInterval || 1,
    repeatUnit: item.repeatUnit || "months",
    fixedInterval: Boolean(item.fixedInterval),
    nextMaintenanceDate: toInputDate(item.nextMaintenanceDate),
    expiryDate: toInputDate(item.expiryDate),
    notes: item.notes || "",
  };
}
