// Shared utilities and constants for the Properties & Cleaners workspace
// screens. Kept framework-agnostic so both pages import from one place.

// Cycled per-property accent color. Index by list position.
export const PROP_COLORS = [
  '#D85A30', // coral (brand)
  '#378ADD', // sky
  '#22C55E', // green
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#EC4899', // pink
];

export function propColor(i) {
  return PROP_COLORS[(i >= 0 ? i : 0) % PROP_COLORS.length];
}

// Stable hue from a string — used for avatar tinting.
export function hashHue(s = '') {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

// Two-char initials from a name; fall back to first letter of email; then '?'.
export function initials(name = '', email = '') {
  const n = (name || '').trim();
  if (n) return n.split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase() || '').join('');
  const e = (email || '').trim();
  return e ? e[0].toUpperCase() : '?';
}

// Canonical status label + tone for a calendar URL.
export function calStatus(url) {
  if (!url) return { label: 'No calendar', tone: 'pending' };
  if (/fake-ical|test/i.test(url)) return { label: 'Test calendar', tone: 'pending' };
  return { label: 'Connected', tone: 'confirmed' };
}

// Trim the continent prefix so the UI can show "New York" instead of
// "America/New_York".
export function formatTz(tz) {
  if (!tz) return '';
  return tz.replace('America/', '').replace('Pacific/', '').replace(/_/g, ' ');
}

export const US_TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
];

export const PLATFORMS = ['Airbnb', 'VRBO', 'Booking.com', 'Other'];

// A property has a "needs-action" dot when it lacks a calendar, a primary
// cleaner, or when its primary cleaner hasn't accepted the invite yet.
export function propertyNeedsAction(p) {
  if (!p) return false;
  if (!p.ical_url) return true;
  if (!p.cleaner_email && !p.cleaner_name) return true;
  if ((p.cleaner_email || p.cleaner_name) && !p.cleaner_confirmed) return true;
  return false;
}

// Derive cleaner records from the properties table.
// Mirrors the backend's existing column layout: each property carries a
// primary (`cleaner_*`) and optional backup (`backup_cleaner_*`). We group
// those assignments by email (lowercased) so each person appears once,
// with the list of properties they cover and their role per property.
export function buildCleanerList(properties) {
  const map = {};

  for (const p of properties) {
    if (p.cleaner_name || p.cleaner_email) {
      const key = (p.cleaner_email || p.cleaner_name || '').toLowerCase();
      if (!map[key]) {
        map[key] = {
          key,
          name: p.cleaner_name || '',
          email: p.cleaner_email || '',
          userId: p.cleaner_user_id || null,
          confirmed: !!p.cleaner_confirmed,
          properties: [],
        };
      }
      if (p.cleaner_name && !map[key].name) map[key].name = p.cleaner_name;
      if (p.cleaner_user_id) {
        map[key].userId = p.cleaner_user_id;
        map[key].confirmed = !!p.cleaner_confirmed;
      }
      map[key].properties.push({ id: p.id, name: p.name, role: 'primary' });
    }

    if (p.backup_cleaner_name || p.backup_cleaner_email) {
      const key = (p.backup_cleaner_email || p.backup_cleaner_name || '').toLowerCase();
      if (!map[key]) {
        map[key] = {
          key,
          name: p.backup_cleaner_name || '',
          email: p.backup_cleaner_email || '',
          userId: p.backup_cleaner_user_id || null,
          confirmed: !!p.backup_cleaner_user_id,
          properties: [],
        };
      }
      if (p.backup_cleaner_name && !map[key].name) map[key].name = p.backup_cleaner_name;
      if (p.backup_cleaner_user_id && !map[key].userId) {
        map[key].userId = p.backup_cleaner_user_id;
        map[key].confirmed = true;
      }
      map[key].properties.push({ id: p.id, name: p.name, role: 'backup' });
    }
  }

  return Object.values(map);
}
