import client from '../../api/client';

// baseURL이 '/api' 이므로 경로 앞에 '/api' 중복 금지.

export function fetchLastEditedProject() {
  return client.get('/projects/last-edited').then((r) => r.data);
}

export function fetchMyProjects(params = {}) {
  return client.get('/projects', { params }).then((r) => r.data);
}

export function fetchMyOrders(limit) {
  const params = {};
  if (limit != null) params.limit = limit;
  return client.get('/orders', { params }).then((r) => r.data);
}

export function fetchOwnedAnthologies() {
  return client.get('/anthology', { params: { role: 'owner' } }).then((r) => r.data);
}

export function fetchJoinedAnthologies() {
  return client.get('/anthology', { params: { role: 'contributor' } }).then((r) => r.data);
}
