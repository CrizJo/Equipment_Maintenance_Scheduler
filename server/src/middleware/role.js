const ROLES = ["Admin", "Manager", "Technician"];

export function attachRole(req, _res, next) {
  const role = req.header("X-Role") || "Manager";
  req.role = ROLES.includes(role) ? role : "Manager";
  req.technicianName = req.header("X-Technician-Name") || "";
  next();
}

export function requireRoles(...allowed) {
  return (req, res, next) => {
    if (!allowed.includes(req.role)) {
      return res.status(403).json({
        error: `This action requires ${allowed.join(" or ")} access.`,
      });
    }
    next();
  };
}

export function canCompleteRecord(req, record) {
  if (req.role === "Admin" || req.role === "Manager") return true;
  if (req.role !== "Technician") return false;
  if (!req.technicianName) return false;
  return record.assignedTo.toLowerCase() === req.technicianName.toLowerCase();
}
