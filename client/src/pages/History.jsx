import { useEffect, useMemo, useState } from "react";
import { Calendar, Search } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import { api } from "../lib/api.js";
import { useRole } from "../context/RoleContext.jsx";
import { formatDayLabel } from "../lib/dates.js";
import { statusLabel, TASK_STATUS_STYLES, TYPE_STYLES } from "../lib/maintenanceUi.js";

const TYPE_FILTERS = [
  { value: "all", label: "All" },
  { value: "preventive", label: "Preventive" },
  { value: "corrective", label: "Corrective" },
  { value: "inspection", label: "Inspection" },
];

export default function History() {
  const { role, technicianName } = useRole();
  const [records, setRecords] = useState([]);
  const [tab, setTab] = useState("upcoming");
  const [typeFilter, setTypeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api("/api/maintenance")
      .then(setRecords)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [role, technicianName]);

  const stats = useMemo(() => {
    return {
      completed: records.filter((item) => item.status === "completed").length,
      preventive: records.filter((item) => item.type === "preventive").length,
      corrective: records.filter((item) => item.type === "corrective").length,
      inspection: records.filter((item) => item.type === "inspection").length,
    };
  }, [records]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((item) => {
      const isPast = item.status === "completed";
      const matchesTab = tab === "past" ? isPast : !isPast;
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const haystack = [item.equipment?.name, item.description, item.assignedTo, item.type]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !needle || haystack.includes(needle);
      return matchesTab && matchesType && matchesQuery;
    });
  }, [records, tab, typeFilter, query]);

  return (
    <div className="px-8 py-8">
      <PageHeader title="Maintenance History" subtitle="Complete log of all maintenance activities" />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Preventive" value={stats.preventive} />
        <StatCard label="Corrective" value={stats.corrective} />
        <StatCard label="Inspections" value={stats.inspection} />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("upcoming")}
          className={`rounded-full px-4 py-2 text-sm ${tab === "upcoming" ? "bg-[#1d1d1f] text-white" : "bg-white text-[#6e6e73]"}`}
        >
          Upcoming
        </button>
        <button
          type="button"
          onClick={() => setTab("past")}
          className={`rounded-full px-4 py-2 text-sm ${tab === "past" ? "bg-[#1d1d1f] text-white" : "bg-white text-[#6e6e73]"}`}
        >
          Past
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search history..."
            className="w-full rounded-full border border-black/8 bg-white py-3 pl-11 pr-4 text-sm outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPE_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTypeFilter(item.value)}
              className={`rounded-full px-3.5 py-2 text-sm ${
                typeFilter === item.value ? "bg-[#1d1d1f] text-white" : "bg-white text-[#6e6e73]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="mb-4 text-sm text-[#6e6e73]">Loading history...</p>}

      <div className="overflow-hidden rounded-[28px] bg-white">
        <div className="hidden grid-cols-6 border-b border-black/5 px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#86868b] md:grid">
          <span>Equipment</span>
          <span>Type</span>
          <span>Description</span>
          <span>Assigned</span>
          <span>Date</span>
          <span>Status</span>
        </div>
        {visible.map((record) => (
          <div
            key={record.id}
            className="grid gap-2 border-b border-black/5 px-5 py-4 text-sm last:border-0 md:grid-cols-6 md:items-center"
          >
            <span className="font-medium">{record.equipment?.name}</span>
            <span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${TYPE_STYLES[record.type]}`}>
                {record.type}
              </span>
            </span>
            <span className="text-[#6e6e73]">{record.description}</span>
            <span className="text-[#6e6e73]">{record.assignedTo}</span>
            <span className="flex items-center gap-1 text-[#6e6e73]">
              <Calendar size={14} /> {formatDayLabel(record.scheduledDate)}
            </span>
            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium capitalize ${TASK_STATUS_STYLES[record.status]}`}>
              {statusLabel(record.status)}
            </span>
          </div>
        ))}
        {!loading && visible.length === 0 && (
          <p className="px-5 py-8 text-sm text-[#6e6e73]">No records match this view.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <p className="text-xs font-medium text-[#86868b]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
