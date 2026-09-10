import { addDays, addWeeks, addMonths, addYears, isWeekend, nextMonday } from "date-fns";

function asDate(value) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
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
