import client from './client';

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }),

  // Unified multi-role signup — replaces legacy /auth/signup + /auth/cleaner-signup.
  // Payload: { role, account: {name, email, password}, workspace?, business?, team_code?, invite_token? }
  complete: (payload) => client.post('/auth/complete', payload),

  // Legacy shims — kept for compatibility with older callers; new code should use complete().
  signup: (name, email, password, role) => client.post('/auth/signup', { name, email, password, role }),
  cleanerSignup: (name, email, password) => client.post('/auth/cleaner-signup', { name, email, password }),

  // Invite acceptance flow — GET decodes the token, POST accepts it.
  getInvite: (token) => client.get(`/invites/${encodeURIComponent(token)}`),
  acceptInvite: (token, payload) => client.post(`/invites/${encodeURIComponent(token)}/accept`, payload),
  resendInvite: (token) => client.post(`/invites/${encodeURIComponent(token)}/resend`),

  logout: () => client.post('/auth/logout'),
  me: () => client.get('/auth/me'),
  updateName: (name) => client.post('/account/update-name', { name }),
  updateEmail: (email, password) => client.post('/account/update-email', { new_email: email, current_password: password }),
  updatePassword: (current, next, confirm) => client.post('/account/update-password', { current_password: current, new_password: next, confirm_password: confirm }),
  deactivate: () => client.post('/account/deactivate'),
  delete: (confirmation) => client.post('/account/delete', { confirmation }),
};

// Team-code verification for the teammate flow at /signup/join.
export const teamApi = {
  verifyCode: (code) => client.post('/teams/verify-code', { code: String(code).replace(/[^A-Z0-9]/gi, '').toUpperCase() }),
};
