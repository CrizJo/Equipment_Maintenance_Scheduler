import { addDays, addWeeks, addMonths, addYears, isWeekend, nextMonday } from "date-fns";

export function asDate(value) {
  if (!value) return new Date(NaN);
  if (typeof value === "string") {
    const isoDate = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDate) {
      return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]));
    }
  }
  const date = value instanceof Date ? new Date(value) : new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toDbDate(value) {
  const date = asDate(value);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function calculateNextDate(fromDate, config) {
  const from = asDate(fromDate);
  const type = config.repeatType || config.repeat_type || "monthly";

  switch (type) {
    case "daily":
      return addDays(from, 1);
    case "weekly":
      return addWeeks(from, 1);
    case "monthly":
      return addMonths(from, 1);
    case "yearly":
      return addYears(from, 1);
    case "weekdays": {
      let next = addDays(from, 1);
      if (isWeekend(next)) next = nextMonday(next);
      return next;
    }
    case "custom": {
      const interval = Number(config.repeatInterval ?? config.repeat_interval ?? 1);
      const unit = config.repeatUnit || config.repeat_unit || "days";
      if (unit === "weeks") return addWeeks(from, interval);
      if (unit === "months") return addMonths(from, interval);
      return addDays(from, interval);
    }
    default:
      return addMonths(from, 1);
  }
}

export function nextDueAfterComplete(scheduledDate, completedDate, config) {
  const done = asDate(completedDate);
  let next = calculateNextDate(scheduledDate || completedDate, config);
  let guard = 0;
  while (!Number.isNaN(next.getTime()) && asDate(next) <= done && guard < 60) {
    next = calculateNextDate(next, config);
    guard += 1;
  }
  return toDbDate(next);
}

export function expiryFlags(expiryDate, today = new Date()) {
  if (!expiryDate) {
    return { isExpired: false, isExpiringSoon: false };
  }

  const expiry = asDate(expiryDate);
  const now = asDate(today);
  const inThirtyDays = addDays(now, 30);

  return {
    isExpired: expiry < now,
    isExpiringSoon: expiry >= now && expiry <= inThirtyDays,
  };
}

export function withEquipmentFlags(equipment, today = new Date()) {
  const flags = expiryFlags(equipment.expiryDate, today);
  return { ...equipment, ...flags };
}
