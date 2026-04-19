// Property portfolio fixtures and cover helpers.
//
// These fixtures back the Properties portfolio screen until the backend
// exposes the same shape. Keep them small and representative; real data
// should ultimately come from `useProperties()` or an equivalent selector.

// Six deterministic fallback palettes for properties that don't have a
// hand-picked cover. Used via `paletteForId(id)` below.
export const COVER_PALETTES = {
  coral: { from: '#F3A475', via: '#E85F34', to: '#9A3A18' },
  amber: { from: '#E8D5A8', via: '#C08419', to: '#6B4410' },
  sage:  { from: '#B8C9A3', via: '#6B8F4E', to: '#2F5E16' },
  sky:   { from: '#A8C8E4', via: '#3B82C4', to: '#1A4F82' },
  plum:  { from: '#D5B8D0', via: '#8B4789', to: '#4A1D4C' },
  warm:  { from: '#DCC9A3', via: '#9C7F4F', to: '#5C3F1F' },
};

const PALETTE_KEYS = Object.keys(COVER_PALETTES);

// Simple deterministic string hash -> palette index.
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function paletteForId(id) {
  if (!id) return COVER_PALETTES.warm;
  const key = PALETTE_KEYS[hashString(String(id)) % PALETTE_KEYS.length];
  return COVER_PALETTES[key];
}

// Three sample properties, matching the shape the UI expects.
export const SAMPLE_PROPERTIES = [
  {
    id: 'obc',
    code: 'OBC',
    name: 'Ocean Breeze Cottage',
    address: '218 Seaside Lane · Cannon Beach, OR',
    beds: 3,
    baths: 2,
    sleeps: 6,
    cover: COVER_PALETTES.coral,
    defaultCleaner: { name: 'Maria Chen', rate: 4.9, jobs: 68 },
    nextTurnover: { date: 'Nov 14', status: 'Action needed', tone: 'urgent' },
    lastCleaned: 'Nov 8',
    ytdTurnovers: 42,
    ytdHours: 178,
    sources: ['Airbnb', 'VRBO', 'Direct'],
    checkinDefault: '3:00 pm',
    checkoutDefault: '11:00 am',
    flagged: true,
    archived: false,
  },
  {
    id: 'dtl',
    code: 'DTL',
    name: 'Downtown Loft',
    address: '42 Pearl Street #5 · Portland, OR',
    beds: 2,
    baths: 1,
    sleeps: 4,
    cover: COVER_PALETTES.amber,
    defaultCleaner: { name: 'Jamal Okafor', rate: 4.8, jobs: 104 },
    nextTurnover: { date: 'Nov 12', status: 'Confirmed', tone: 'confirmed' },
    lastCleaned: 'Nov 7',
    ytdTurnovers: 51,
    ytdHours: 192,
    sources: ['Airbnb', 'Direct'],
    checkinDefault: '4:00 pm',
    checkoutDefault: '11:00 am',
    flagged: false,
    archived: false,
  },
  {
    id: 'mtc',
    code: 'MTC',
    name: 'Mountain Cabin',
    address: '3890 Timber Ridge · Hood River, OR',
    beds: 4,
    baths: 3,
    sleeps: 8,
    cover: COVER_PALETTES.sage,
    defaultCleaner: { name: 'Priya Shah', rate: 4.7, jobs: 39 },
    nextTurnover: { date: 'Nov 15', status: 'Queued', tone: 'queued' },
    lastCleaned: 'Nov 6',
    ytdTurnovers: 21,
    ytdHours: 112,
    sources: ['VRBO', 'Direct'],
    checkinDefault: '4:00 pm',
    checkoutDefault: '10:00 am',
    flagged: false,
    archived: false,
  },
];
