import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import PageHeader from "../components/layout/PageHeader.jsx";
import StatusDonut from "../components/dashboard/StatusDonut.jsx";
import TypeBarChart from "../components/dashboard/TypeBarChart.jsx";
import { api } from "../lib/api.js";
import { useRole } from "../context/RoleContext.jsx";

export default function Dashboard() {
  const { role, technicianName } = useRole();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api("/api/dashboard/stats")
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [role, technicianName]);

  const alerts = [...(stats?.expired || []), ...(stats?.expiringSoon || [])];

  return (
    <div className="px-8 py-8">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of all equipment and maintenance operations"
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {loading && !stats && <p className="mb-4 text-sm text-[#86868b]">Loading overview…</p>}

      {stats && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Equipment" value={stats.totalEquipment} note={`${stats.operational} operational`} />
            <StatCard label="Scheduled Tasks" value={stats.scheduledTasks} note={`${stats.inProgress} in progress`} />
            <StatCard label="Overdue" value={stats.overdue} note="Requires attention" accent />
            <StatCard label="Completed" value={stats.completedThisQuarter} note="This quarter" />
          </div>

          {alerts.length > 0 && (
            <div className="mb-6 flex items-start gap-3 rounded-3xl bg-amber-50 px-5 py-4 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">Expiry attention needed</p>
                <p className="mt-1 text-amber-800">
                  {stats.expired.length} expired and {stats.expiringSoon.length} expiring soon. Status is unchanged —
                  these are flags only.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-2">
            <StatusDonut data={stats.statusBreakdown} />
            <TypeBarChart data={stats.typeBreakdown} />
          </div>
        </>
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
