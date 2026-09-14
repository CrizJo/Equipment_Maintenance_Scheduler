import { useEffect, useMemo, useState } from "react";
import PageHeader from "../components/layout/PageHeader.jsx";
import MonthCalendar from "../components/schedule/MonthCalendar.jsx";
import TaskDrawer from "../components/schedule/TaskDrawer.jsx";
import { api } from "../lib/api.js";
import { useRole } from "../context/RoleContext.jsx";
import { formatDayLabel, toDayKey } from "../lib/dates.js";
import { statusLabel, TASK_DOT_STYLES, TASK_STATUS_STYLES } from "../lib/maintenanceUi.js";

const TASK_FILTERS = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "overdue", label: "Overdue" },
];

export default function Schedule() {
  const { role, technicianName } = useRole();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedDay, setSelectedDay] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await api("/api/maintenance?upcoming=true");
    setTasks(data);
    setLoading(false);
  }

  useEffect(() => {
    load().catch((err) => {
      setError(err.message);
      setLoading(false);
    });
  }, [role, technicianName]);

  const tasksByDay = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const key = toDayKey(task.scheduledDate);
      acc[key] = acc[key] || [];
      acc[key].push(task);
      return acc;
    }, {});
  }, [tasks]);

  const panelTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter = filter === "all" || task.status === filter;
      const matchesDay = !selectedDay || toDayKey(task.scheduledDate) === selectedDay;
      return matchesFilter && matchesDay;
    });
  }, [tasks, filter, selectedDay]);

  function shiftMonth(delta) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  async function completeTask(id, completionNotes) {
    await api(`/api/maintenance/${id}/complete`, {
      method: "PATCH",
      body: { completionNotes },
    });
    setActiveTask(null);
    await load();
  }

  return (
    <div className="flex min-h-0 flex-col px-6 py-6 lg:px-8 lg:py-7">
      <PageHeader title="Schedule" className="mb-5 shrink-0" />
      {error && <p className="mb-3 shrink-0 text-sm text-red-600">{error}</p>}
      {loading && <p className="mb-3 shrink-0 text-sm text-[#6e6e73]">Loading schedule...</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0">
          <MonthCalendar
            year={year}
            month={month}
            tasksByDay={tasksByDay}
            selectedDay={selectedDay}
            onSelectDay={(key) => setSelectedDay((current) => (current === key ? null : key))}
            onPrev={() => shiftMonth(-1)}
            onNext={() => shiftMonth(1)}
          />
        </div>

        <div className="relative min-h-[280px] lg:min-h-0">
          <div className="flex max-h-[50vh] min-h-0 flex-col overflow-hidden rounded-[28px] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] lg:absolute lg:inset-0 lg:max-h-none">
          <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Tasks</h2>
            <div className="flex gap-1">
              {TASK_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-full px-3 py-1.5 text-xs ${
                    filter === item.value ? "bg-[#1d1d1f] text-white" : "bg-[#f5f5f7] text-[#6e6e73]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {selectedDay && (
            <button type="button" onClick={() => setSelectedDay(null)} className="mb-3 shrink-0 text-xs text-[#3b5bdb]">
              Showing {formatDayLabel(selectedDay)} · Clear day filter
            </button>
          )}
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
            {panelTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => setActiveTask(task)}
                className="flex w-full items-start gap-2.5 rounded-2xl px-2.5 py-2.5 text-left hover:bg-[#f5f5f7]"
              >
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${TASK_DOT_STYLES[task.status]}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{task.equipment?.name}</span>
                  <span className="mt-1 block truncate text-sm text-[#6e6e73]">{task.description}</span>
                  <span className="mt-1 block text-xs text-[#86868b]">
                    {formatDayLabel(task.scheduledDate)} · {task.assignedTo}
                  </span>
                </span>
                <span className={`rounded-full px-2 py-1 text-[11px] font-medium capitalize ${TASK_STATUS_STYLES[task.status]}`}>
                  {statusLabel(task.status)}
                </span>
              </button>
            ))}
            {!loading && panelTasks.length === 0 && (
              <p className="px-2 py-8 text-sm text-[#6e6e73]">No tasks for this view.</p>
            )}
          </div>
          </div>
        </div>
      </div>

      {activeTask && (
        <TaskDrawer
          task={activeTask}
          role={role}
          technicianName={technicianName}
          onClose={() => setActiveTask(null)}
          onComplete={completeTask}
        />
      )}
    </div>
  );
}
