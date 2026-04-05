import client from './client';

export const settingsApi = {
  // Create property
  createProperty: (data) =>
    client.post('/properties/create', data),

  // Properties
  updatePropertyName: (property_id, name) =>
    client.post('/settings/property/name', { property_id, name }),
  updatePropertyPlatform: (property_id, platform) =>
    client.post('/settings/property/platform', { property_id, platform }),
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

  // Host notification preferences
  getNotificationPrefs: () =>
    client.get('/settings/notifications').catch(() => ({ data: null })),
  saveNotificationPrefs: (prefs) =>
    client.post('/settings/notifications', prefs),

  // Language
  updateLanguage: (language) =>
    client.post('/account/update-language', { language }),
};
