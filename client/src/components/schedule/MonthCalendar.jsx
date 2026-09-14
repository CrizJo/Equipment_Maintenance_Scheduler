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
    <div className="flex flex-col rounded-[28px] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-5">
      <div className="mb-3 flex shrink-0 items-center justify-between">
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

      <div className="grid shrink-0 grid-cols-7 gap-1.5 text-center text-xs font-medium text-[#86868b]">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1.5">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell) => {
          const dayTasks = tasksByDay[cell.key] || [];
          const isSelected = selectedDay === cell.key;
          return (
            <button
              key={cell.key}
              type="button"
              onClick={() => onSelectDay(cell.key)}
              className={`flex aspect-[1.45/1] min-h-0 flex-col overflow-hidden rounded-2xl border p-1.5 text-left transition sm:p-2 ${
                isSelected
                  ? "border-[#3b5bdb] bg-white ring-1 ring-[#3b5bdb]/35"
                  : "border-[#e6e6ea] bg-[#f7f7f8] hover:bg-[#f0f0f2]"
              } ${cell.inMonth ? "text-[#1d1d1f]" : "text-[#c7c7cc]"}`}
            >
              <span
                className={`mb-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm ${
                  cell.key === today ? "bg-[#1d1d1f] text-white" : ""
                }`}
              >
                {cell.day}
              </span>
              <div className="min-h-0 space-y-0.5 overflow-hidden">
                {dayTasks.slice(0, 2).map((task) => (
                  <p
                    key={task.id}
                    className={`truncate rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      cell.inMonth ? pillClass(task) : "bg-[#eeeeef] text-[#aeaeb2]"
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
