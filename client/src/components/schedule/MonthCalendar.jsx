import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildMonthCells, monthTitle, todayKey } from "../../lib/dates.js";
import { TASK_STATUS_STYLES, TYPE_STYLES } from "../../lib/maintenanceUi.js";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pillClass(task) {
  if (task.status === "overdue") return TASK_STATUS_STYLES.overdue;
  return TYPE_STYLES[task.type] || TASK_STATUS_STYLES[task.status] || "bg-slate-100 text-slate-600";
}

export default function MonthCalendar({ year, month, tasksByDay, selectedDay, onSelectDay, onPrev, onNext }) {
  const cells = buildMonthCells(year, month);
  const today = todayKey();

  return (
    <div className="rounded-[28px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">{monthTitle(year, month)}</h2>
        <div className="flex gap-2">
          <button type="button" onClick={onPrev} className="rounded-full p-2 hover:bg-[#f5f5f7]" aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={onNext} className="rounded-full p-2 hover:bg-[#f5f5f7]" aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#86868b]">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const dayTasks = tasksByDay[cell.key] || [];
          const isSelected = selectedDay === cell.key;
          const hasTasks = dayTasks.length > 0;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDay(cell.key)}
              className={`min-h-[108px] rounded-2xl border p-2 text-left transition ${
                isSelected
                  ? "border-[#3b5bdb] bg-[#eef1ff] ring-1 ring-[#3b5bdb]/30"
                  : hasTasks
                    ? "border-[#ececef] bg-[#fbfbfc] hover:bg-[#f5f5f7]"
                    : "border-transparent hover:bg-[#f5f5f7]"
              } ${cell.inMonth ? "text-[#1d1d1f]" : "text-[#c7c7cc]"}`}
            >
              <span
                className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                  cell.key === today ? "bg-[#1d1d1f] text-white" : ""
                }`}
              >
                {cell.day}
              </span>
              <div className="mt-1 space-y-1">
                {dayTasks.slice(0, 2).map((task) => (
                  <p
                    key={task.id}
                    className={`truncate rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      cell.inMonth ? pillClass(task) : "bg-[#f2f2f7] text-[#aeaeb2]"
                    }`}
                  >
                    {task.equipment?.name || "Task"}
                  </p>
                ))}
                {dayTasks.length > 2 && (
                  <p className="px-1 text-[10px] text-[#86868b]">+{dayTasks.length - 2} more</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
