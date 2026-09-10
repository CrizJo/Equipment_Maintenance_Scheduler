const ROLE_KEY = "equipsync.role";
const TECH_KEY = "equipsync.technicianName";

let currentRole = localStorage.getItem(ROLE_KEY) || "Manager";
let currentTechnician = localStorage.getItem(TECH_KEY) || "";

export function setApiIdentity(role, technicianName) {
  currentRole = role || "Manager";
  currentTechnician = technicianName || "";
  localStorage.setItem(ROLE_KEY, currentRole);
  localStorage.setItem(TECH_KEY, currentTechnician);
}

export function getStoredRole() {
  return currentRole;
}

export function getStoredTechnician() {
  return currentTechnician;
}

export async function api(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    "X-Role": getStoredRole(),
    "X-Technician-Name": getStoredTechnician(),
    ...options.headers,
  };

  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}
