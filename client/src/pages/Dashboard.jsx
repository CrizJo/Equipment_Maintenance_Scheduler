import { useEffect, useState } from "react";
import PageHeader from "../components/layout/PageHeader.jsx";
import PlaceholderPage from "../components/layout/PlaceholderPage.jsx";
import { api } from "../lib/api.js";
import { useRole } from "../context/RoleContext.jsx";

export default function Dashboard() {
  const { role, technicianName } = useRole();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/api/dashboard/stats")
      .then(setStats)
      .catch((err) => setError(err.message));
  }, [role, technicianName]);

  return (
    <div className="px-8 py-8">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of all equipment and maintenance operations"
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {stats && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Equipment" value={stats.totalEquipment} note={`${stats.operational} operational`} />
          <StatCard label="Scheduled Tasks" value={stats.scheduledTasks} note={`${stats.inProgress} in progress`} />
          <StatCard label="Overdue" value={stats.overdue} note="Requires attention" accent />
          <StatCard label="Completed" value={stats.completedThisQuarter} note="This quarter" />
        </div>
      )}
      <PlaceholderPage
        title="Charts come in a later phase"
        description="The shell is connected to the API. Donut and bar charts will be added on the Dashboard page next."
      />
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
