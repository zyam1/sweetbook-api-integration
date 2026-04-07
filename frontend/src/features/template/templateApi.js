import client from '../../api/client';

export const templateApi = {
  list(params) {
    return client.get('/templates', { params });
  },
  get(templateUid) {
    return client.get(`/templates/${templateUid}`);
  },
};
