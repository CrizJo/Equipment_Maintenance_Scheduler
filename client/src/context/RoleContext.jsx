import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setApiIdentity } from "../lib/api.js";

const RoleContext = createContext(null);

const ROLES = ["Admin", "Manager", "Technician"];
const ROLE_KEY = "equipsync.role";
const TECH_KEY = "equipsync.technicianName";

export function RoleProvider({ children }) {
  const [role, setRoleState] = useState(() => localStorage.getItem(ROLE_KEY) || "Manager");
  const [technicianName, setTechnicianState] = useState(
    () => localStorage.getItem(TECH_KEY) || ""
  );
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    setApiIdentity(role, technicianName);
  }, [role, technicianName]);

  useEffect(() => {
    api("/api/technicians")
      .then((names) => {
        setTechnicians(names);
        if (!localStorage.getItem(TECH_KEY) && names[0]) {
          setTechnicianState(names[0]);
          localStorage.setItem(TECH_KEY, names[0]);
        }
      })
      .catch(() => setTechnicians([]));
  }, []);

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
      roles: ROLES,
      canManageEquipment: role === "Admin" || role === "Manager",
      canDeleteEquipment: role === "Admin",
    }),
    [role, technicianName, technicians]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used inside RoleProvider");
  return context;
}
