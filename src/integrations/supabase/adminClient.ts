// Клиент админки: тот же supabase-js, но запросы идут через /api/admin-db —
// серверный прокси Vercel, который выполняет их сервисным ключом после
// проверки логина панели. Нужен потому, что 29.08.2026 у публичного ключа
// отозвали запись в таблицы (панель писала напрямую из браузера).
//
// В менеджерах импортируется как `import { adminDb as supabase } ...`,
// поэтому весь остальной код не менялся.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_SBb7mMchz99ZIfoPgnxQDQ_bbQpePNZ';

const PANEL_AUTH_KEY = 'panel_auth';

export function setPanelAuth(username: string, password: string): void {
  const utf8 = unescape(encodeURIComponent(`${username}:${password}`));
  localStorage.setItem(PANEL_AUTH_KEY, btoa(utf8));
}

export function clearPanelAuth(): void {
  localStorage.removeItem(PANEL_AUTH_KEY);
}

export function hasPanelAuth(): boolean {
  return !!localStorage.getItem(PANEL_AUTH_KEY);
}

// Заголовок авторизации читается в момент запроса, а не при создании клиента:
// вход мог произойти позже загрузки модуля.
const proxiedFetch: typeof fetch = (input, init = {}) => {
  const headers = new Headers(init.headers);
  const auth = localStorage.getItem(PANEL_AUTH_KEY);
  if (auth) headers.set('x-panel-auth', auth);
  return fetch(input, { ...init, headers });
};

export const adminDb = createClient<Database>(
  `${window.location.origin}/api/admin-db`,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: proxiedFetch },
  },
);
