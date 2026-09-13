import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { MoreHorizontal, Search, Wrench } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import OperatorModal from "../components/operators/OperatorModal.jsx";
import { api } from "../lib/api.js";
import { useRole } from "../context/RoleContext.jsx";

export default function Operators() {
  const { role, canManageOperators, canDeleteOperators, refreshTechnicians } = useRole();
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [menuId, setMenuId] = useState(null);

  async function load() {
    setLoading(true);
    const data = await api("/api/technicians");
    setOperators(data);
    await refreshTechnicians(data);
    setLoading(false);
  }

  useEffect(() => {
    if (role === "Technician") return;
    load().catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, [role]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return operators.filter((person) => {
      const haystack = `${person.name} ${person.notes}`.toLowerCase();
      return !needle || haystack.includes(needle);
    });
  }, [operators, query]);

  const totals = useMemo(() => {
    return operators.reduce(
      (acc, person) => {
        acc.equipment += person.equipmentCount;
        acc.open += person.openTasks;
        acc.overdue += person.overdue;
        return acc;
      },
      { equipment: 0, open: 0, overdue: 0 }
    );
  }, [operators]);

  async function handleSave(payload) {
    setSaving(true);
    setFormError("");
    try {
      const data =
        modal?.mode === "edit"
          ? await api(`/api/technicians/${modal.item.id}`, { method: "PUT", body: payload })
          : await api("/api/technicians", { method: "POST", body: payload });
      setOperators(data);
      await refreshTechnicians(data);
      setModal(null);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete ${item.name}? Equipment assigned to them must be reassigned first.`)) return;
    try {
      const data = await api(`/api/technicians/${item.id}`, { method: "DELETE" });
      setOperators(data);
      await refreshTechnicians(data);
    } catch (err) {
      setError(err.message);
    }
  }

  if (role === "Technician") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="px-8 py-8">
      <PageHeader
        title="Operators"
        subtitle="Technicians who are assigned equipment and maintenance work"
        actions={
          canManageOperators && (
            <button
              type="button"
              onClick={() => {
                setFormError("");
                setModal({ mode: "add", item: null });
              }}
              className="rounded-full bg-[#1d1d1f] px-5 py-2.5 text-sm font-medium text-white"
            >
              + Add operator
            </button>
          )
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Operators" value={operators.length} note="On the roster" />
        <StatCard label="Assigned equipment" value={totals.equipment} note="Across all operators" />
        <StatCard label="Open tasks" value={totals.open} note="Scheduled, in progress, overdue" />
        <StatCard label="Overdue" value={totals.overdue} note="Needs attention" accent />
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search operators..."
          className="w-full rounded-full border border-black/8 bg-white py-3 pl-11 pr-4 text-sm outline-none"
        />
      </div>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading && <p className="mb-4 text-sm text-[#6e6e73]">Loading operators...</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((person) => (
          <article key={person.id} className="relative rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[17px] font-semibold tracking-tight">{person.name}</h2>
                {person.notes ? (
                  <p className="mt-1 text-sm text-[#6e6e73]">{person.notes}</p>
                ) : (
                  <p className="mt-1 text-sm text-[#86868b]">No notes</p>
                )}
              </div>
              {canManageOperators && (
                <button
                  type="button"
                  onClick={() => setMenuId(menuId === person.id ? null : person.id)}
                  className="rounded-full p-1 text-[#86868b] hover:bg-[#f5f5f7]"
                  aria-label="Operator actions"
                >
                  <MoreHorizontal size={16} />
                </button>
              )}
            </div>

            {menuId === person.id && (
              <div className="absolute right-4 top-12 z-10 overflow-hidden rounded-2xl border border-black/8 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-[#f5f5f7]"
                  onClick={() => {
                    setFormError("");
                    setMenuId(null);
                    setModal({ mode: "edit", item: person });
                  }}
                >
                  Edit
                </button>
                {canDeleteOperators && (
                  <button
                    type="button"
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setMenuId(null);
                      handleDelete(person);
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            )}

            <p className="mt-4 flex items-center gap-2 text-sm text-[#6e6e73]">
              <Wrench size={14} /> {person.equipmentCount} equipment
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <MiniStat label="Open" value={person.openTasks} />
              <MiniStat label="Overdue" value={person.overdue} accent={person.overdue > 0} />
              <MiniStat label="Done" value={person.completed} />
            </div>
          </article>
        ))}
      </div>

      {!loading && filtered.length === 0 && !error && (
        <p className="mt-6 text-sm text-[#6e6e73]">No operators match this search.</p>
      )}

      {modal && (
        <OperatorModal
          title={modal.mode === "edit" ? "Edit operator" : "Add operator"}
          initial={modal.item}
          saving={saving}
          error={formError}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, note, accent }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className={`text-xs font-medium ${accent ? "text-red-500" : "text-[#86868b]"}`}>{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-[#6e6e73]">{note}</p>
    </div>
  );
}

function MiniStat({ label, value, accent }) {
  return (
    <div className="rounded-2xl bg-[#f5f5f7] px-2 py-3">
      <p className={`text-lg font-semibold ${accent ? "text-red-600" : "text-[#1d1d1f]"}`}>{value}</p>
      <p className="text-[11px] text-[#86868b]">{label}</p>
    </div>
  );
}
