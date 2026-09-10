import { useState } from "react";
import { X } from "lucide-react";
import RepeatPicker from "./RepeatPicker.jsx";

const STATUSES = [
  { value: "operational", label: "Operational" },
  { value: "under_maintenance", label: "Under Maintenance" },
  { value: "out_of_service", label: "Out of Service" },
  { value: "retired", label: "Retired" },
];

const CATEGORIES = ["Machinery", "Utilities", "Lab Equipment", "Vehicles", "Medical", "HVAC"];

export default function EquipmentModal({ title, initial, technicians, saving, error, onClose, onSave }) {
  const [form, setForm] = useState(initial);

  function update(partial) {
    setForm((current) => ({ ...current, ...partial }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave({
      ...form,
      repeatInterval: form.repeatType === "custom" ? Number(form.repeatInterval) || 1 : null,
      repeatUnit: form.repeatType === "custom" ? form.repeatUnit : null,
      nextMaintenanceDate: form.nextMaintenanceDate || null,
      expiryDate: form.expiryDate || null,
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10 sm:pt-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-[#f5f5f7]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <Field label="Equipment Name">
          <input
            required
            value={form.name}
            onChange={(event) => update({ name: event.target.value })}
            placeholder="e.g., CNC Milling Machine"
            className={inputClass}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <input
              required
              list="equipment-categories"
              value={form.category}
              onChange={(event) => update({ category: event.target.value })}
              className={inputClass}
            />
            <datalist id="equipment-categories">
              {CATEGORIES.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </Field>
          <Field label="Location">
            <input
              required
              value={form.location}
              onChange={(event) => update({ location: event.target.value })}
              placeholder="e.g., Workshop A"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status">
            <select
              value={form.status}
              onChange={(event) => update({ status: event.target.value })}
              className={inputClass}
            >
              {STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assigned To">
            <input
              required
              list="technician-names"
              value={form.assignedTechnician}
              onChange={(event) => update({ assignedTechnician: event.target.value })}
              placeholder="e.g., John Smith"
              className={inputClass}
            />
            <datalist id="technician-names">
              {technicians.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </Field>
        </div>

        <RepeatPicker
          repeatType={form.repeatType}
          repeatInterval={form.repeatInterval}
          repeatUnit={form.repeatUnit}
          onChange={update}
        />

        <label className="mt-5 flex items-start gap-3 rounded-2xl bg-[#f5f5f7] p-4">
          <input
            type="checkbox"
            checked={form.fixedInterval}
            onChange={(event) => update({ fixedInterval: event.target.checked })}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium">Fixed interval</span>
            <span className="mt-1 block text-xs leading-5 text-[#6e6e73]">
              If on: when a job is completed, the next maintenance date is calculated automatically.
              If off: a manager must set the next date by hand.
            </span>
          </span>
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Next maintenance date">
            <input
              type="date"
              value={form.nextMaintenanceDate}
              onChange={(event) => update({ nextMaintenanceDate: event.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Expiry date">
            <input
              type="date"
              value={form.expiryDate}
              onChange={(event) => update({ expiryDate: event.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
        <p className="mt-1 text-xs text-[#86868b]">
          Expiry is a warning only. The machine status does not change by itself when the date passes.
        </p>

        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(event) => update({ notes: event.target.value })}
            placeholder="Optional notes..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 w-full rounded-full bg-[#1d1d1f] py-3.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : title}
        </button>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#3b5bdb]";
