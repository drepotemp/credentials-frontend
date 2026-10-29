const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

let adminKey = '';

export function setAdminKey(value) {
  adminKey = value ? String(value) : '';
}

/**
 * Who is opening the panel. Inside Telegram this is the mini app user id,
 * which is what the bot's admin check already uses.
 */
export function resolveIdentity() {
  const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  if (tg) {
    tg.ready?.();
    tg.expand?.();
    tg.setHeaderColor?.('#0a0a0f');
    tg.setBackgroundColor?.('#0a0a0f');
  }

  const user = tg?.initDataUnsafe?.user;
  if (user?.id) return String(user.id);

  // Outside Telegram (local preview): ?key=<username or telegram id>
  const fromUrl = new URLSearchParams(window.location.search).get('key');
  return fromUrl ? fromUrl.trim() : null;
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(adminKey ? { 'x-admin-key': adminKey } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  base: BASE,

  verify: () => request('/api/auth/verify', { method: 'POST' }),

  stats: () => request('/api/stats'),
  users: ({ status, q } = {}) => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (q) params.set('q', q);
    const qs = params.toString();
    return request(`/api/users${qs ? `?${qs}` : ''}`);
  },
  updateUser: (id, status) => request(`/api/users/${id}`, { method: 'PATCH', body: { status } }),
  deleteUser: (id) => request(`/api/users/${id}`, { method: 'DELETE' }),

  admins: () => request('/api/admins'),
  addAdmin: (identifier) => request('/api/admins', { method: 'POST', body: { identifier } }),
  removeAdmin: (id) => request(`/api/admins/${id}`, { method: 'DELETE' }),
};
