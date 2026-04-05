import client from './client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

function postLegacySettingsRoute(path, data) {
  const url = BACKEND_URL ? `${BACKEND_URL}${path}` : path;
  return client.post(url, data);
}

export const settingsApi = {
  // Create property
  createProperty: (data) =>
    client.post('/properties/create', data),

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
    postLegacySettingsRoute('/settings/cleaner/resend-invite', { property_id }),
  swapCleaners: (property_id) =>
    client.post('/settings/cleaner/swap-primary-backup', { property_id }),
  promoteBackup: (property_id) =>
    client.post('/settings/cleaner/promote-backup', { property_id }),

  // TODO: implement GET /api/notification-prefs — host notification preferences
  getNotificationPrefs: () => {
    return Promise.resolve({ data: null });
  },
  // TODO: implement POST /api/settings/notifications — host notification save
  saveNotificationPrefs: (prefs) => {
    return Promise.resolve({ data: { ok: true } });
  },

  // TODO: implement POST /api/account/update-language — language preference
  updateLanguage: (language) => {
    return Promise.resolve({ data: { ok: true } });
  },

  // TODO: implement POST /api/settings/property/name — property rename
  updatePropertyName: (property_id, name) => {
    return Promise.resolve({ data: { ok: true } });
  },

  // TODO: implement POST /api/settings/property/platform — platform change
  updatePropertyPlatform: (property_id, platform) => {
    return Promise.resolve({ data: { ok: true } });
  },
};
