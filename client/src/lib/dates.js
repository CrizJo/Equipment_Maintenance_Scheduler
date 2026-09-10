export function toDayKey(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

export function formatDayLabel(value) {
  const key = toDayKey(value);
  if (!key) return "—";
  const date = new Date(`${key}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function monthTitle(year, month) {
  return new Date(year, month, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function buildMonthCells(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    const day = prevMonthDays - firstWeekday + 1 + i;
    cells.push({
      key: toDayKey(new Date(year, month - 1, day)),
      day,
      inMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      key: toDayKey(new Date(year, month, day)),
      day,
      inMonth: true,
    });
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      key: toDayKey(new Date(year, month + 1, nextDay)),
      day: nextDay,
      inMonth: false,
    });
    nextDay += 1;
  }

  return cells;
}

export function todayKey() {
  return toDayKey(new Date());
}
