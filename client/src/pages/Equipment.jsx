import { useEffect, useMemo, useState } from "react";
import { MapPin, MoreHorizontal, Search, User } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import EquipmentModal from "../components/equipment/EquipmentModal.jsx";
import { repeatSummary } from "../components/equipment/RepeatPicker.jsx";
import { api } from "../lib/api.js";
import { useRole } from "../context/RoleContext.jsx";
import { emptyEquipmentForm, equipmentToForm, formatDisplayDate } from "../lib/equipmentForm.js";

const STATUS_STYLES = {
  operational: "bg-emerald-50 text-emerald-700",
  under_maintenance: "bg-amber-50 text-amber-700",
  out_of_service: "bg-red-50 text-red-700",
  retired: "bg-slate-100 text-slate-600",
};

const STATUS_LABELS = {
  operational: "Operational",
  under_maintenance: "Maintenance",
  out_of_service: "Out of Service",
  retired: "Retired",
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "operational", label: "Operational" },
  { value: "under_maintenance", label: "Maintenance" },
  { value: "out_of_service", label: "Out of Order" },
  { value: "retired", label: "Retired" },
];

export default function Equipment() {
  const { role, technicianName, technicians, canManageEquipment, canDeleteEquipment } = useRole();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [menuId, setMenuId] = useState(null);

  async function load() {
    setLoading(true);
    const data = await api("/api/equipment");
    setItems(data);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, [role, technicianName]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesQuery =
        !needle ||
        [item.name, item.category, item.location, item.assignedTechnician]
          .join(" ")
          .toLowerCase()
          .includes(needle);
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  async function handleSave(payload) {
    setSaving(true);
    setFormError("");
    try {
      if (modal?.mode === "edit") {
        await api(`/api/equipment/${modal.item.id}`, { method: "PUT", body: payload });
      } else {
        await api("/api/equipment", { method: "POST", body: payload });
      }
      await load();
      setModal(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete ${item.name}? This also deletes its maintenance history.`)) return;
    try {
      await api(`/api/equipment/${item.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="px-8 py-8">
      <PageHeader
        title="Equipment"
        subtitle="Manage all equipment and their maintenance status"
        actions={
          canManageEquipment && (
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setModal({ mode: "add", item: null, initial: emptyEquipmentForm() });
              }}
              className="rounded-full bg-[#1d1d1f] px-5 py-2.5 text-sm font-medium text-white"
            >
              + Add Equipment
            </button>
          )
        }
      />

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search equipment..."
            className="w-full rounded-full border border-black/8 bg-white py-3 pl-11 pr-4 text-sm outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-full px-3.5 py-2 text-sm ${
                statusFilter === filter.value
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-white text-[#6e6e73]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="mb-4 text-sm text-[#6e6e73]">Loading equipment...</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <article key={item.id} className="relative rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-semibold tracking-tight">{item.name}</h2>
                <p className="mt-1 text-sm text-[#6e6e73]">{item.category}</p>
              </div>
              <div className="flex items-center gap-2">
                {item.isExpired && (
                  <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600">
                    Expired
                  </span>
                )}
                {!item.isExpired && item.isExpiringSoon && (
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-700">
                    Expiring
                  </span>
                )}
                {canManageEquipment && (
                  <button
                    type="button"
                    onClick={() => setMenuId(menuId === item.id ? null : item.id)}
                    className="rounded-full p-1 text-[#86868b] hover:bg-[#f5f5f7]"
                    aria-label="Equipment actions"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                )}
              </div>
            </div>

            {menuId === item.id && (
              <div className="absolute right-4 top-12 z-10 overflow-hidden rounded-2xl border border-black/8 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-[#f5f5f7]"
                  onClick={() => {
                    setFormError("");
                    setMenuId(null);
                    setModal({ mode: "edit", item, initial: equipmentToForm(item) });
                  }}
                >
                  Edit
                </button>
                {canDeleteEquipment && (
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setMenuId(null);
                      handleDelete(item);
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            )}

            <p className="mt-4 flex items-center gap-2 text-sm text-[#6e6e73]">
              <MapPin size={14} /> {item.location}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-[#6e6e73]">
              <User size={14} /> {item.assignedTechnician}
            </p>
            <p className="mt-2 text-xs text-[#86868b]">
              {repeatSummary(item.repeatType, item.repeatInterval, item.repeatUnit)}
              {item.fixedInterval ? " · Fixed interval" : " · Manual next date"}
            </p>
            <div className="mt-5 flex items-center justify-between">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[item.status]}`}>
                {STATUS_LABELS[item.status]}
              </span>
              <span className="text-xs text-[#86868b]">Next: {formatDisplayDate(item.nextMaintenanceDate)}</span>
            </div>
          </article>
        ))}
      </div>

      {!loading && filtered.length === 0 && !error && (
        <p className="mt-6 text-sm text-[#6e6e73]">No equipment matches this search or filter.</p>
      )}

      {modal && (
        <EquipmentModal
          title={modal.mode === "edit" ? "Edit Equipment" : "Add New Equipment"}
          initial={modal.initial}
          technicians={technicians}
          saving={saving}
          error={formError}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
