import axios from 'axios';

export const NEW_ORDER_POLL_MS = 8000;

/**
 * A web não abre o STOMP em /ws/sync: o handshake exige Authorization e o
 * WebSocket do navegador não envia esse header. O ping STOMP só traz o cursor;
 * o Android também baixa GET /stores/me/sync. Este pull é o mesmo contrato,
 * limitado à loja do JWT.
 */
export async function fetchStoreSyncStatus() {
  const response = await axios.get('/stores/me/sync-status');
  return response.data;
}

export async function fetchStoreSyncSince(after, etag) {
  const response = await axios.get('/stores/me/sync', {
    params: { after },
    headers: etag ? { 'If-None-Match': etag } : undefined,
    validateStatus: (status) => status === 200 || status === 304,
  });
  return {
    status: response.status,
    data: response.status === 304 ? null : response.data,
    etag: response.headers?.etag || null,
  };
}
