import axios from 'axios';
import { API_BASE_URL } from '../../../../services/apiConfig';

const EMPLOYEES_URL = `${API_BASE_URL}/api/employees`;

function roleToProfile(role) {
  if (role === 'WAITER') return 'GARCOM';
  if (role === 'ADMIN' || role === 'STORE_ADMIN') return 'STORE_ADMIN';
  if (role === 'KITCHEN') return 'KITCHEN';
  if (role === 'CASHIER') return 'CASHIER';
  return role || '';
}

function profileToRole(profile) {
  if (profile === 'GARCOM' || profile === 'WAITER') return 'WAITER';
  if (profile === 'ADMIN' || profile === 'STORE_ADMIN') return 'STORE_ADMIN';
  if (profile === 'COZINHA' || profile === 'KITCHEN') return 'KITCHEN';
  if (profile === 'CAIXA' || profile === 'CASHIER') return 'CASHIER';
  return profile;
}

export function toUiEmployee(dto) {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email || '',
    phone: dto.phone || '',
    profile: roleToProfile(dto.role),
    role: dto.role,
    storeId: dto.storeId,
    storeName: dto.storeName,
    waiterId: dto.waiterId,
    active: dto.active,
  };
}

export function toApiPayload(employee) {
  const payload = {
    name: employee.name,
    email: employee.email,
    role: profileToRole(employee.profile || employee.role),
  };
  if (employee.password) {
    payload.password = employee.password;
  }
  if (employee.active !== undefined) {
    payload.active = employee.active;
  }
  return payload;
}

export function getEmployees() {
  return axios.get(EMPLOYEES_URL).then((response) => ({
    ...response,
    data: (response.data || []).map(toUiEmployee),
  }));
}

export function saveEmployee(employee) {
  return axios.post(EMPLOYEES_URL, toApiPayload(employee)).then((response) => ({
    ...response,
    data: toUiEmployee(response.data),
  }));
}

export function updateEmployee(employee) {
  return axios.put(`${EMPLOYEES_URL}/${employee.id}`, toApiPayload(employee)).then((response) => ({
    ...response,
    data: toUiEmployee(response.data),
  }));
}

export function deleteEmployee(id) {
  return axios.delete(`${EMPLOYEES_URL}/${id}`);
}
