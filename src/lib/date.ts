/** Local-time date helpers. Day keys are 'YYYY-MM-DD' in the device's local timezone. */

export type DateKey = string;

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateKey(d: Date = new Date()): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: DateKey, days: number): DateKey {
  const d = fromDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

/** The last `n` day keys ending at `end` (inclusive), oldest first. */
export function lastNDays(n: number, end: DateKey = toDateKey()): DateKey[] {
  return Array.from({ length: n }, (_, i) => addDays(end, i - (n - 1)));
}

export function isToday(key: DateKey) {
  return key === toDateKey();
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function weekdayShort(key: DateKey) {
  return WEEKDAYS[fromDateKey(key).getDay()];
}

/** "Today", "Yesterday", or "Tue, 12 Nov". */
export function friendlyDay(key: DateKey) {
  const today = toDateKey();
  if (key === today) return 'Today';
  if (key === addDays(today, -1)) return 'Yesterday';
  if (key === addDays(today, 1)) return 'Tomorrow';
  const d = fromDateKey(key);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function shortDate(key: DateKey) {
  const d = fromDateKey(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function greeting(hour = new Date().getHours()) {
  if (hour < 5) return 'Late night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
