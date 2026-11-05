/** Formatting helpers — currency, dates, ranges. */

export const money = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    ...opts,
  }).format(n);

export const pct = (n: number) => `${Math.round(n)}%`;

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const weekday = (d: Date) => WEEKDAYS[d.getDay()];

export const fmtDate = (d: Date | string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    typeof d === "string" ? new Date(d) : d,
  );

export const fmtDateLong = (d: Date | string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(typeof d === "string" ? new Date(d) : d);

export const fmtRange = (a: Date, b: Date) => {
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const left = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(a);
  const right = new Intl.DateTimeFormat("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
  }).format(b);
  return `${left} – ${right}`;
};

export const nightsBetween = (a: Date, b: Date) => {
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.round(ms / 86400000));
};

export const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Opening logic for the OpenNowBadge — per house, real clock. */
export type HouseId = "lodge" | "hearth" | "vessel" | "meadowlark" | "trailhead" | "grove";

export function openState(house: HouseId, now = new Date()): { open: boolean; until: string; label: string } {
  const mins = now.getHours() * 60 + now.getMinutes();
  const day = now.getDay(); // 0 Sun
  switch (house) {
    case "lodge":
      return { open: true, until: "22:00", label: "Reception 07–22" };
    case "hearth": {
      const open = [3, 4, 5, 6].includes(day) && mins >= 1020; // Wed–Sat from 17:00 kitchen, seating 18:30
      const sun = day === 0 && mins >= 730 && mins <= 930;
      return { open: open || sun, until: "22:30", label: "Wed–Sun · 18:30" };
    }
    case "vessel": {
      const open = [4, 5, 6].includes(day) && mins >= 660; // Thu–Sat from 11:00
      return { open, until: "20:30", label: "Thu–Sat · 11:00" };
    }
    case "meadowlark":
      return { open: mins >= 420 && mins < 1260, until: "21:00", label: "Daily 07–21" };
    case "trailhead":
      return { open: mins >= 390, until: "19:00", label: "Daily 06:30–19:00" };
    case "grove": {
      const m = now.getMonth();
      return { open: m >= 4 && m <= 9, until: "23:00", label: "May–Oct season" };
    }
  }
}
