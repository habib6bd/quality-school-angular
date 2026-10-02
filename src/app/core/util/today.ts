const dhaka = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' });

/** Today's calendar date in Dhaka as `YYYY-MM-DD` (the school's local date, not the server's). */
export function todayIso(now: Date = new Date()): string {
  return dhaka.format(now);
}
