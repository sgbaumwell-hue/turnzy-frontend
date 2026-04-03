import client from './client';

export const cleanerApi = {
  getJobs: () => client.get('/cleaner/jobs'),
  acceptJob: (id) => client.post(`/cleaner/jobs/${id}/accept`),
  declineJob: (id) => client.post(`/cleaner/jobs/${id}/decline`),
  completeJob: (id) => client.post(`/cleaner/jobs/${id}/complete`),
  reportIssue: (id, description) => client.post(`/cleaner/jobs/${id}/issue`, { description }),
};
