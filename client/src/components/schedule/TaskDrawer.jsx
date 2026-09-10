import { useState } from "react";
import { X } from "lucide-react";
import { formatDayLabel } from "../../lib/dates.js";
import { canCompleteTask, statusLabel, TASK_STATUS_STYLES, TYPE_STYLES } from "../../lib/maintenanceUi.js";

export default function TaskDrawer({ task, role, technicianName, onClose, onComplete }) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const allowed = canCompleteTask(role, technicianName, task);

  async function handleComplete() {
    setSaving(true);
    setError("");
    try {
      await onComplete(task.id, notes);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30">
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-black/5 px-6 py-5">
          <div>
            <p className="text-sm text-[#86868b]">Maintenance task</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{task.equipment?.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-[#f5f5f7]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5 text-sm">
          <p className="leading-6 text-[#6e6e73]">{task.description}</p>
          <p>
            <span className="text-[#86868b]">Assigned: </span>
            {task.assignedTo}
          </p>
          <p>
            <span className="text-[#86868b]">Date: </span>
            {formatDayLabel(task.scheduledDate)}
          </p>
          <div className="flex gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${TYPE_STYLES[task.type]}`}>
              {task.type}
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${TASK_STATUS_STYLES[task.status]}`}>
              {statusLabel(task.status)}
            </span>
          </div>

          {allowed && (
            <label className="block">
              <span className="mb-1.5 block font-medium">Completion notes</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                placeholder="What was done?"
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#3b5bdb]"
              />
            </label>
          )}
          {error && <p className="text-red-600">{error}</p>}
        </div>

        {allowed && (
          <div className="border-t border-black/5 p-6">
            <button
              type="button"
              disabled={saving}
              onClick={handleComplete}
              className="w-full rounded-full bg-[#1d1d1f] py-3.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving..." : "Mark complete"}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
