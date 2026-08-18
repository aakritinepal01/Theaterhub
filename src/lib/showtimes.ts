import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const timeListSchema = z.string().transform((value, ctx) => {
  const times = value.split(",").map((time) => time.trim()).filter(Boolean);
  for (const time of times) {
    const match = /^(\d{1,2}):(\d{1,2})$/.exec(time);
    if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
      ctx.addIssue({ code: "custom", message: "Please enter a valid Time." });
      return z.NEVER;
    }
  }
  return times.join(", ");
});

const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

function combineKathmandu(date: Date, value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(hours).padStart(2, "0");
  const min = String(minutes).padStart(2, "0");
  return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:00+05:45`);
}

export async function regenerateShows(scheduleId: number) {
  const schedule = await prisma.showsMeta.findUnique({
    where: { id: scheduleId }, include: { excludeDates: true, extraShows: true },
  });
  if (!schedule) throw new Error("Schedule not found");
  const excluded = new Set(schedule.excludeDates.map((item) => item.date.toISOString().slice(0, 10)));
  const rows: { playId: number; theatreId: number; showtime: Date }[] = [];
  for (let date = new Date(schedule.startDate); date <= schedule.endDate; date.setUTCDate(date.getUTCDate() + 1)) {
    const current = new Date(date);
    if (excluded.has(current.toISOString().slice(0, 10))) continue;
    const values = schedule[weekdays[current.getUTCDay()]].split(",").map((x) => x.trim()).filter(Boolean);
    for (const value of values) rows.push({ playId: schedule.playId, theatreId: schedule.theatreId, showtime: combineKathmandu(current, value) });
  }
  for (const extra of schedule.extraShows) for (const value of extra.time.split(",").map((x) => x.trim()).filter(Boolean)) {
    rows.push({ playId: schedule.playId, theatreId: schedule.theatreId, showtime: combineKathmandu(extra.date, value) });
  }
  await prisma.$transaction(async (tx) => {
    await tx.show.deleteMany({ where: { playId: schedule.playId } });
    if (rows.length) await tx.show.createMany({ data: rows });
  });
  return rows.length;
}
