import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  History,
  LayoutDashboard,
  LogOut,
  Wrench,
} from "lucide-react";
import { useState } from "react";
import { useRole } from "../../context/RoleContext.jsx";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/equipment", label: "Equipment", icon: Wrench },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/history", label: "History", icon: History },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { role, setRole, technicianName, setTechnicianName, technicians } = useRole();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <aside
        className={`relative flex shrink-0 flex-col border-r border-black/5 bg-[#0f1115] text-white transition-all duration-300 ${
          collapsed ? "w-[88px]" : "w-[248px]"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 font-semibold">
            E
          </div>
          {!collapsed && (
            <div>
              <p className="text-[15px] font-semibold tracking-tight">EquipSync</p>
              <p className="text-xs text-white/45">Maintenance ops</p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mx-4 mb-5 rounded-2xl bg-white/6 p-1">
            <div className="grid grid-cols-3 gap-1">
              {["Admin", "Manager", "Technician"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setRole(item)}
                  className={`rounded-xl px-1 py-2 text-[11px] font-medium transition ${
                    role === item ? "bg-white text-[#1d1d1f]" : "text-white/60 hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            {role === "Technician" && (
              <select
                value={technicianName}
                onChange={(event) => setTechnicianName(event.target.value)}
                className="mt-2 w-full rounded-xl border-0 bg-black/30 px-3 py-2 text-xs text-white outline-none"
              >
                {technicians.length === 0 && <option value="">No technicians</option>}
                {technicians.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {collapsed && (
          <p className="mb-4 px-3 text-center text-[10px] uppercase tracking-wider text-white/40">
            {role.slice(0, 3)}
          </p>
        )}

        <nav className="flex flex-1 flex-col gap-1 px-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? "bg-white text-[#1d1d1f]" : "text-white/70 hover:bg-white/8 hover:text-white"
                  } ${collapsed ? "justify-center" : ""}`
                }
              >
                <Icon size={18} />
                {!collapsed && item.label}
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => navigate("/")}
          className={`mx-3 mb-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/55 hover:bg-white/8 hover:text-white ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} />
          {!collapsed && "Back to home"}
        </button>

        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="absolute -right-3 top-24 flex h-6 w-6 items-center justify-center rounded-full border border-black/10 bg-white text-[#1d1d1f] shadow-sm"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
