import client from '../../api/client';

export function signupApi({ name, email, password }) {
  return client
    .post('/auth/signup', { name, email, password })
    .then((res) => res.data.data);
}

export function loginApi({ email, password }) {
  return client
    .post('/auth/login', { email, password })
    .then((res) => res.data.data);
}
