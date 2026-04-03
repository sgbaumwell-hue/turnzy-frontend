import client from './client';

export const bookingsApi = {
  getAll: (params) => client.get('/bookings', { params }),
  getOne: (id) => client.get(`/bookings/${id}`),
  respond: (id, action) => client.post(`/bookings/${id}/respond`, { action }),
  dismiss: (id) => client.post(`/bookings/${id}/dismiss`),
  resend: (id) => client.post(`/bookings/${id}/resend`),
  confirm: (id) => client.post(`/bookings/${id}/confirm`),
  markPaid: (id, amount) => client.post(`/bookings/${id}/mark-paid`, { amount }),
  notifyNow: (id) => client.post(`/bookings/${id}/notify-now`),
  requestTimeChange: (id, data) => client.post(`/bookings/${id}/request-time-change`, data),
  pollNow: () => client.post('/poll-icals'),
  getActivity: () => client.get('/activity'),
};
