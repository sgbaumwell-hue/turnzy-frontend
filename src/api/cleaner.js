import client from './client';

export const cleanerApi = {
  // Jobs
  getJobs: () => client.get('/cleaner/jobs'),
  acceptJob: (id) => client.post(`/cleaner/jobs/${id}/accept`),
  declineJob: (id) => client.post(`/cleaner/jobs/${id}/decline`),
  completeJob: (id) => client.post(`/cleaner/jobs/${id}/complete`),
  reportIssue: (id, description) => client.post(`/cleaner/jobs/${id}/issue`, { description }),

  // Team management (lead cleaner)
  getTeam: () => client.get('/cleaner/team'),
  addTeamMember: (data) => client.post('/cleaner/team/add', data),
  resendInvite: (id) => client.post(`/cleaner/team/${id}/resend`),
  removeTeamMember: (id) => client.delete(`/cleaner/team/${id}`),
  toggleTeam: (has_team) => client.post('/cleaner/team/toggle', { has_team }),
  assignJob: (bookingId, team_member_id, note) => client.post(`/cleaner/jobs/${bookingId}/assign`, { team_member_id, note }),
  getAssignment: (bookingId) => client.get(`/cleaner/jobs/${bookingId}/assignment`),
};

export const teamApi = {
  // Team member dashboard
  getAssignments: () => client.get('/team/assignments'),
  confirmAssignment: (id) => client.post(`/team/assignments/${id}/confirm`),
  declineAssignment: (id) => client.post(`/team/assignments/${id}/decline`),
  startAssignment: (id) => client.post(`/team/assignments/${id}/start`),
  completeAssignment: (id) => client.post(`/team/assignments/${id}/complete`),
  reportIssue: (id, note) => client.post(`/team/assignments/${id}/issue`, { note }),

  // Account creation
  validateToken: (token) => client.get(`/team/validate-token?token=${token}`),
  acceptInvite: (data) => client.post('/team/accept', data),
};
