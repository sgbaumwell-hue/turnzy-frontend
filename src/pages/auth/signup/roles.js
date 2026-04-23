export const ROLE = {
  host: {
    key: 'host',
    label: 'Host',
    accent: '#E85F34',
    accent2: '#C8481F',
    panelBg: '#1F1D1A',
    panelTint: 'radial-gradient(circle at 20% 30%, #E85F34 0%, transparent 45%), radial-gradient(circle at 80% 70%, #E85F34 0%, transparent 40%)',
    eyebrow: 'Property owner · host',
    headline: ['One list.', 'Every turnover.', 'Handled.'],
    tagline: 'Turnzy syncs bookings from Airbnb, VRBO, and Hostaway — then quietly keeps your cleaning crew in lock-step with every check-out.',
    stats: [['4,812', 'Turnovers / month'], ['98.2%', 'Confirmed on time']],
  },
  cleaner: {
    key: 'cleaner',
    label: 'Cleaner',
    accent: '#2F7A3F',
    accent2: '#1F5428',
    panelBg: '#172318',
    panelTint: 'radial-gradient(circle at 20% 30%, #3F8F2F 0%, transparent 45%), radial-gradient(circle at 75% 70%, #E85F34 0%, transparent 35%)',
    eyebrow: 'Cleaning business · owner',
    headline: ['Your route.', 'Your rhythm.', 'One schedule.'],
    tagline: 'See every turnover across all the properties you clean — without managing seven different host texts and calendars.',
    stats: [['210+', 'Cleaning crews'], ['Avg 4.9★', 'On-time rating']],
  },
  teammate: {
    key: 'teammate',
    label: 'Teammate',
    accent: '#2F6BBD',
    accent2: '#1F538E',
    panelBg: '#161E2A',
    panelTint: 'radial-gradient(circle at 20% 30%, #3A7AC2 0%, transparent 45%), radial-gradient(circle at 80% 70%, #E85F34 0%, transparent 30%)',
    eyebrow: 'Teammate · crew member',
    headline: ['Show up.', 'Clock in.', 'Done.'],
    tagline: 'Turnzy tells you what property, what time, and what the host needs — one tap to confirm, one tap to wrap.',
    stats: [['31k', 'Jobs completed'], ['< 2min', 'To accept a shift']],
  },
};

export function getRole(key) {
  return ROLE[key] || ROLE.host;
}
