// Lightweight date utilities — no external dependency needed for our use case

export function toDateObj(dateStr: string): Date {
  // Parse YYYY-MM-DD without timezone shift
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function format(dateStr: string, fmt: string): string {
  const d = toDateObj(dateStr);

  // Use placeholders to avoid later replacements corrupting already-substituted
  // text (e.g. the 'd' in 'Saturday' being replaced by the day number).
  const tokens: Record<string, string> = {
    EEEE: DAYS[d.getDay()],
    EEE:  DAYS_SHORT[d.getDay()],
    MMMM: MONTHS[d.getMonth()],
    MMM:  MONTHS_SHORT[d.getMonth()],
    MM:   String(d.getMonth() + 1).padStart(2, '0'),
    dd:   String(d.getDate()).padStart(2, '0'),
    d:    String(d.getDate()),
    yyyy: String(d.getFullYear()),
    yy:   String(d.getFullYear()).slice(-2),
  };

  // Replace tokens longest-first so e.g. 'EEEE' is consumed before 'EEE',
  // 'MMMM' before 'MMM', 'MM', 'dd' before 'd', and 'yyyy' before 'yy'.
  const pattern = /EEEE|EEE|MMMM|MMM|MM|dd|d|yyyy|yy/g;
  return fmt.replace(pattern, (match) => tokens[match] ?? match);
}

export function addDays(dateStr: string, n: number): string {
  const d = toDateObj(dateStr);
  d.setDate(d.getDate() + n);
  // Use local date components to avoid UTC timezone shift (e.g. in IST +5:30
  // toISOString() can return the previous day).
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function subDays(dateStr: string, n: number): string {
  return addDays(dateStr, -n);
}

export function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTime(timeStr: string): string {
  // "09:00:00" → "9:00 AM"
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}
