import { useState } from "react";
import { X } from "lucide-react";

export default function OperatorModal({ title, initial, saving, error, onClose, onSave }) {
  const [name, setName] = useState(initial?.name || "");
  const [notes, setNotes] = useState(initial?.notes || "");

  function handleSubmit(event) {
    event.preventDefault();
    onSave({ name: name.trim(), notes: notes.trim() });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10 sm:pt-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-[#f5f5f7]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {error && <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-medium text-[#1d1d1f]">Name</span>
          <input
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g., John Smith"
            className="w-full rounded-2xl border border-black/8 bg-[#f5f5f7] px-4 py-3 text-sm outline-none"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-2 block text-sm font-medium text-[#1d1d1f]">Notes</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            placeholder="Shift, specialty, or contact notes"
            className="w-full resize-none rounded-2xl border border-black/8 bg-[#f5f5f7] px-4 py-3 text-sm outline-none"
          />
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-sm text-[#6e6e73]">
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#1d1d1f] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
