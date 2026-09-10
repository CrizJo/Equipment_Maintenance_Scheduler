import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "weekdays", label: "Every Weekday (Mon – Fri)" },
  { value: "custom", label: "Custom" },
];

export function repeatSummary(repeatType, repeatInterval, repeatUnit) {
  const option = OPTIONS.find((item) => item.value === repeatType);
  if (repeatType === "custom") {
    const unit = repeatUnit || "days";
    return `Every ${repeatInterval || 1} ${unit}`;
  }
  return option?.label || "Monthly";
}

export default function RepeatPicker({ repeatType, repeatInterval, repeatUnit, onChange }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    function handleClick(event) {
      if (boxRef.current && !boxRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <label className="mb-1.5 block text-sm font-medium text-[#1d1d1f]">Time interval</label>
      <p className="mb-2 text-xs text-[#86868b]">
        How often this machine should be serviced — like a reminder in TickTick or an alarm.
      </p>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm"
      >
        <span>{repeatSummary(repeatType, repeatInterval, repeatUnit)}</span>
        <ChevronDown size={16} className="text-[#86868b]" />
      </button>

      {open && (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-black/10 bg-white py-1 shadow-xl">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange({
                  repeatType: option.value,
                  repeatInterval: option.value === "custom" ? repeatInterval || 1 : null,
                  repeatUnit: option.value === "custom" ? repeatUnit || "days" : null,
                });
                if (option.value !== "custom") setOpen(false);
              }}
              className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-[#f5f5f7] ${
                repeatType === option.value ? "bg-[#f5f5f7] font-medium" : ""
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {repeatType === "custom" && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-[#6e6e73]">Every</span>
          <input
            type="number"
            min="1"
            value={repeatInterval || 1}
            onChange={(event) =>
              onChange({
                repeatType: "custom",
                repeatInterval: Number(event.target.value) || 1,
                repeatUnit: repeatUnit || "days",
              })
            }
            className="w-20 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#3b5bdb]"
          />
          <select
            value={repeatUnit || "days"}
            onChange={(event) =>
              onChange({
                repeatType: "custom",
                repeatInterval: repeatInterval || 1,
                repeatUnit: event.target.value,
              })
            }
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="days">days</option>
            <option value="weeks">weeks</option>
            <option value="months">months</option>
          </select>
        </div>
      )}
    </div>
  );
}
