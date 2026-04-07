import client from '../../api/client';

const CONTRIB_KEY = 'contributorJwt';

export const getContributorToken = () => localStorage.getItem(CONTRIB_KEY);
export const setContributorToken = (t) => localStorage.setItem(CONTRIB_KEY, t);
export const clearContributorToken = () => localStorage.removeItem(CONTRIB_KEY);

const contribHeaders = () => {
  const t = getContributorToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// 합동지 (owner/contributor 조회)
export async function listAnthologies(role = 'owner') {
  const { data } = await client.get('/anthology', { params: { role } });
  return data;
}

export async function createAnthology(payload) {
  const { data } = await client.post('/anthology', payload);
  return data;
}

export async function getAnthology(id) {
  const { data } = await client.get(`/anthology/${id}`);
  return data;
}

export async function updateCover(id, payload) {
  const { data } = await client.patch(`/anthology/${id}/cover`, payload);
  return data;
}

export async function listContributors(id) {
  const { data } = await client.get(`/anthology/${id}/contributors`);
  return data;
}

export async function createContributor(id, payload) {
  const { data } = await client.post(`/anthology/${id}/contributors`, payload);
  return data;
}

export async function finalizeAnthology(id) {
  const { data } = await client.post(`/anthology/${id}/finalize`);
  return data;
}

export async function orderAnthology(id, payload) {
  const { data } = await client.post(`/anthology/${id}/order`, payload);
  return data;
}

// 참여자 인증/제출 (별도 JWT)
export async function contributorAuth(token, handle) {
  const { data } = await client.post('/anthology/contrib/auth', { token, handle });
  if (data?.token) setContributorToken(data.token);
  return data;
}

export async function submitContribution(file, extra = {}) {
  const form = new FormData();
  form.append('file', file);
  Object.entries(extra).forEach(([k, v]) => form.append(k, v));
  const { data } = await client.post('/anthology/contrib/submissions', form, {
    headers: { ...contribHeaders(), 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function listMySubmissions() {
  const { data } = await client.get('/anthology/contrib/me/submissions', {
    headers: contribHeaders(),
  });
  return data;
}

export async function ownerUploadForContributor(id, cid, file, extra = {}) {
  const form = new FormData();
  form.append('file', file);
  Object.entries(extra).forEach(([k, v]) => form.append(k, v));
  const { data } = await client.post(`/anthology/${id}/contributors/${cid}/submissions`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function reorderContributors(id, orderedIds) {
  const { data } = await client.patch(`/anthology/${id}/contributors/order`, { orderedIds });
  return data;
}

export async function getContribDashboard() {
  const { data } = await client.get('/anthology/contrib/me/dashboard', {
    headers: contribHeaders(),
  });
  return data;
}
