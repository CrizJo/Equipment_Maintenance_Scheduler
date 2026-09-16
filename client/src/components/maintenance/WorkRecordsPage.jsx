import { useEffect, useMemo, useState } from "react";
import { Calendar, Search, User } from "lucide-react";
import PageHeader from "../layout/PageHeader.jsx";
import { api } from "../../lib/api.js";
import { useRole } from "../../context/RoleContext.jsx";
import { formatDayLabel } from "../../lib/dates.js";
import { statusLabel, TASK_STATUS_STYLES, TYPE_STYLES } from "../../lib/maintenanceUi.js";

export default function WorkRecordsPage({
  title,
  subtitle,
  status,
  emptyMessage,
  dateLabel,
}) {
  const { role, technicianName } = useRole();
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api(`/api/maintenance?status=${status}`)
      .then(setRecords)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [role, technicianName, status]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = records.filter((item) => {
      const haystack = [item.equipment?.name, item.description, item.completionNotes, item.assignedTo]
        .join(" ")
        .toLowerCase();
      return !needle || haystack.includes(needle);
    });

    return filtered.sort((a, b) => {
      const aKey = status === "completed" ? a.completedDate || a.scheduledDate : a.scheduledDate;
      const bKey = status === "completed" ? b.completedDate || b.scheduledDate : b.scheduledDate;
      return new Date(bKey).getTime() - new Date(aKey).getTime();
    });
  }, [records, query, status]);

  return (
    <div className="px-8 py-8">
      <PageHeader title={title} subtitle={subtitle} />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search equipment or technician..."
          className="w-full rounded-full border border-black/8 bg-white py-3 pl-11 pr-4 text-sm outline-none"
        />
      </div>

      {loading && <p className="mb-4 text-sm text-[#6e6e73]">Loading records...</p>}

      <div className="overflow-hidden rounded-[28px] bg-white">
        <div className="hidden grid-cols-5 border-b border-black/5 px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#86868b] md:grid">
          <span>Equipment</span>
          <span>Technician</span>
          <span>Type</span>
          <span>{dateLabel}</span>
          <span>Status</span>
        </div>
        {visible.map((record) => (
          <div
            key={record.id}
            className="grid gap-2 border-b border-black/5 px-5 py-4 text-sm last:border-0 md:grid-cols-5 md:items-center"
          >
            <div>
              <p className="font-medium">{record.equipment?.name}</p>
              <p className="mt-1 text-xs text-[#86868b] md:hidden">
                {record.status === "completed" && record.completionNotes
                  ? record.completionNotes
                  : record.description}
              </p>
            </div>
            <p className="flex items-center gap-1.5 text-[#6e6e73]">
              <User size={14} /> {record.assignedTo}
            </p>
            <span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${TYPE_STYLES[record.type]}`}>
                {record.type}
              </span>
            </span>
            <p className="flex items-center gap-1 text-[#6e6e73]">
              <Calendar size={14} />{" "}
              {formatDayLabel(status === "completed" ? record.completedDate || record.scheduledDate : record.scheduledDate)}
            </p>
            <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium capitalize ${TASK_STATUS_STYLES[record.status]}`}>
              {statusLabel(record.status)}
            </span>
          </div>
        ))}
        {!loading && visible.length === 0 && (
          <p className="px-5 py-8 text-sm text-[#6e6e73]">{emptyMessage}</p>
        )}
      </div>
    </div>
  );
}
