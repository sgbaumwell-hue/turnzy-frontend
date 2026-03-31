import client from './client';

export const propertiesApi = {
  getAll: () => client.get('/properties'),
};
