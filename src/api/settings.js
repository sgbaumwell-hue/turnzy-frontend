import client from './client';

export const settingsApi = {
  // Properties
  updatePropertyTimes: (property_id, default_checkout_time, default_checkin_time) =>
    client.post('/settings/property/times', { property_id, default_checkout_time, default_checkin_time }),
  updatePropertyTimezone: (property_id, timezone) =>
    client.post('/settings/property/timezone', { property_id, timezone }),
  updateIcal: (property_id, ical_url) =>
    client.post('/settings/ical/update', { property_id, ical_url }),
  disconnectIcal: (property_id) =>
    client.post('/settings/ical/disconnect', { property_id }),
  generateTestCalendar: (property_id) =>
    client.post('/admin/fake-ical/generate-token', { property_id }),

  // Cleaners
  updateCleaner: (data) =>
    client.post('/settings/cleaner/update', data),
  deleteCleaner: (property_id, role) =>
    client.post('/settings/cleaner/delete', { property_id, role }),
  saveBackupCleaner: (data) =>
    client.post('/settings/backup-cleaner/save', data),
  resendInvite: (property_id) =>
    client.post('/settings/cleaner/resend-invite', { property_id }),
  swapCleaners: (property_id) =>
    client.post('/settings/cleaner/swap-primary-backup', { property_id }),
  promoteBackup: (property_id) =>
    client.post('/settings/cleaner/promote-backup', { property_id }),

  // Notifications
  getNotificationPrefs: () => {
    // TODO: endpoint missing — stub
    console.warn('Endpoint missing: GET /api/notification-prefs');
    return Promise.resolve({ data: null });
  },
  saveNotificationPrefs: (prefs) => {
    // TODO: endpoint missing — stub
    console.warn('Endpoint missing: POST /api/settings/notifications', prefs);
    return Promise.resolve({ data: { ok: true } });
  },

  // Language
  updateLanguage: (language) => {
    // TODO: endpoint missing — stub
    console.warn('Endpoint missing: POST /api/account/update-language', { language });
    return Promise.resolve({ data: { ok: true } });
  },

  // Property name update
  updatePropertyName: (property_id, name) => {
    // TODO: endpoint missing — stub
    console.warn('Endpoint missing: POST /api/settings/property/name', { property_id, name });
    return Promise.resolve({ data: { ok: true } });
  },

  // Property platform update
  updatePropertyPlatform: (property_id, platform) => {
    // TODO: endpoint missing — stub
    console.warn('Endpoint missing: POST /api/settings/property/platform', { property_id, platform });
    return Promise.resolve({ data: { ok: true } });
  },
};
