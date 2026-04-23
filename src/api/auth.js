import client from './client';

export const authApi = {
  login: (email, password) => client.post('/auth/login', { email, password }),
  signup: (name, email, password, role) => client.post('/auth/signup', { name, email, password, role }),
  cleanerSignup: (name, email, password) => client.post('/auth/cleaner-signup', { name, email, password }),
  logout: () => client.post('/auth/logout'),
  me: () => client.get('/auth/me'),
  updateName: (name) => client.post('/account/update-name', { name }),
  updateEmail: (email, password) => client.post('/account/update-email', { new_email: email, current_password: password }),
  updatePassword: (current, next, confirm) => client.post('/account/update-password', { current_password: current, new_password: next, confirm_password: confirm }),
  deactivate: () => client.post('/account/deactivate'),
  delete: (confirmation) => client.post('/account/delete', { confirmation }),
};
