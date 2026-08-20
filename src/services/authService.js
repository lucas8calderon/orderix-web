import axios from 'axios';
import { API_BASE_URL } from './apiConfig';
import { saveSession, clearSession, getCurrentUser } from './session';

export async function login(email, password) {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
    email,
    password,
  });
  const { token, user } = response.data;
  saveSession(token, user);
  return user;
}

export function logout() {
  clearSession();
}

export { getCurrentUser };

export default login;
