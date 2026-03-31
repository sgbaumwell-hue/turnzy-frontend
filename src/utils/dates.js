export function fmtDate(dateStr) {
  if (!dateStr) return '';
  try {
    const clean = dateStr.toString().slice(0, 10);
    const [year, month, day] = clean.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return dateStr; }
}

export function fmtDateLong(dateStr) {
  if (!dateStr) return '';
  try {
    const clean = dateStr.toString().slice(0, 10);
    const [year, month, day] = clean.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

export function fmtTime(timeStr) {
  if (!timeStr) return '';
  try {
    const clean = timeStr.toString().trim();
    if (clean.includes('AM') || clean.includes('PM')) return clean;
    const [h, m] = clean.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  } catch { return timeStr; }
}

export function getMonthDay(dateStr) {
  if (!dateStr) return { month: '', day: '' };
  try {
    const clean = dateStr.toString().slice(0, 10);
    const [year, month, day] = clean.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: String(day),
    };
  } catch { return { month: '', day: '' }; }
}