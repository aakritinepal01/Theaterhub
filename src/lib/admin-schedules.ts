export const scheduleDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export type AdminScheduleInput = {
  playId: number;
  startDate: Date;
  endDate: Date;
} & Record<(typeof scheduleDays)[number], string>;

type ParseResult =
  | { success: true; data: AdminScheduleInput }
  | { success: false; error: string };

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function dateValue(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return !value || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? null : date;
}

export function parseAdminScheduleForm(formData: FormData): ParseResult {
  const playId = Number(text(formData, "playId"));
  if (!Number.isInteger(playId) || playId < 1) return { success: false, error: "Select a valid production." };

  const startDate = dateValue(text(formData, "startDate"));
  const endDate = dateValue(text(formData, "endDate"));
  if (!startDate || !endDate || endDate < startDate) {
    return { success: false, error: "Enter a valid schedule date range." };
  }

  const slots = Object.fromEntries(scheduleDays.map((day) => [day, text(formData, day)])) as Record<(typeof scheduleDays)[number], string>;
  for (const day of scheduleDays) {
    const times = slots[day].split(",").map((time) => time.trim()).filter(Boolean);
    if (times.some((time) => !timePattern.test(time))) {
      return { success: false, error: `Use 24-hour HH:MM format for ${day}.` };
    }
    slots[day] = times.join(", ");
  }
  if (!scheduleDays.some((day) => slots[day])) {
    return { success: false, error: "Add at least one weekly show time." };
  }

  return { success: true, data: { playId, startDate, endDate, ...slots } };
}
