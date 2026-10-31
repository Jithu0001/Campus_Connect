import api from './axios';

export async function login(role,email,password){
  const res = await api.post(`/login-${role}`, {
    email,
    password,
  });
  return res;
}

export async function logout(refreshToken) {
  return api.post('/logout', { refreshToken });
}
