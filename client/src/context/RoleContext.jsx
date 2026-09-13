import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setApiIdentity } from "../lib/api.js";

const RoleContext = createContext(null);

const ROLES = ["Admin", "Manager", "Technician"];
const ROLE_KEY = "equipsync.role";
const TECH_KEY = "equipsync.technicianName";

function namesFromPayload(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => (typeof row === "string" ? row : row.name)).filter(Boolean);
}

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(() => localStorage.getItem(ROLE_KEY) || "Manager");
  const [technicianName, setTechnicianState] = useState(
    () => localStorage.getItem(TECH_KEY) || ""
  );
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    setApiIdentity(role, technicianName);
  }, [role, technicianName]);

  const refreshTechnicians = useCallback(async (rows) => {
    const names = namesFromPayload(rows ?? (await api("/api/technicians")));
    setTechnicians(names);
    setTechnicianState((current) => {
      if (names.includes(current)) return current;
      const next = names[0] || "";
      localStorage.setItem(TECH_KEY, next);
      return next;
    });
    return names;
  }, []);

  useEffect(() => {
    refreshTechnicians().catch(() => setTechnicians([]));
  }, [refreshTechnicians]);

  function setRole(next) {
    setApiIdentity(next, technicianName);
    setRoleState(next);
  }

  function setTechnicianName(next) {
    setApiIdentity(role, next);
    setTechnicianState(next);
  }

  const value = useMemo(
    () => ({
      role,
      setRole,
      technicianName,
      setTechnicianName,
      technicians,
      refreshTechnicians,
      roles: ROLES,
      canManageEquipment: role === "Admin" || role === "Manager",
      canDeleteEquipment: role === "Admin",
      canManageOperators: role === "Admin" || role === "Manager",
      canDeleteOperators: role === "Admin",
    }),
    [role, technicianName, technicians, refreshTechnicians]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used inside RoleProvider");
  return context;
}
