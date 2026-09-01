import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ndpkxustvcijykzxqxrn.supabase.co';

/**
 * Прокси PostgREST для админки.
 *
 * 29.08.2026 у публичного anon-ключа отозвали запись почти во все таблицы
 * (см. maincomby_bot/miniapp/supabase/migrations/20260829_lock_anon_writes_phase1.sql),
 * и панель, писавшая напрямую из браузера, осталась без записи. Здесь те же
 * PostgREST-запросы выполняются сервисным ключом — но только для таблиц панели
 * и только после проверки логина/пароля админа (заголовок x-panel-auth,
 * base64 "username:password", кладётся при входе).
 *
 * Клиент — supabase-js, направленный на /api/admin-db (см.
 * src/integrations/supabase/adminClient.ts), поэтому синтаксис запросов
 * в менеджерах не менялся.
 */

// Всё, чем управляет панель. Таблицы вне списка недоступны даже с паролем.
const TABLES = new Set([
  'speakers',
  'events',
  'event_speakers',
  'event_program',
  'sponsors',
  'event_sponsors',
  'locations',
  'posts',
  'tracking_pixels',
  'miniapp_config',
  'leads',
  'companies',
  'custom_badges',
  'user_badges',
  'user_companies',
  'page_configs',
  'page_sections',
  'bot_events',
  'bot_registrations',
  'bot_users',
  'bot_feedback',
  'broadcast_queue',
]);

const RPC_FUNCTIONS = new Set(['send_ticket']);

// Заголовки, которые честно доносим до PostgREST (пагинация, upsert, профили)
const FORWARD_REQUEST_HEADERS = [
  'content-type',
  'accept',
  'prefer',
  'range',
  'range-unit',
  'accept-profile',
  'content-profile',
];

const FORWARD_RESPONSE_HEADERS = ['content-type', 'content-range', 'preference-applied'];

async function checkAuth(req, serviceKey) {
  const raw = req.headers['x-panel-auth'];
  if (!raw || typeof raw !== 'string') return null;

  let username = '';
  let password = '';
  try {
    const decoded = Buffer.from(raw, 'base64').toString('utf8');
    const sep = decoded.indexOf(':');
    if (sep <= 0) return null;
    username = decoded.slice(0, sep);
    password = decoded.slice(sep + 1);
  } catch {
    return null;
  }
  if (!username || !password) return null;

  const supabase = createClient(SUPABASE_URL, serviceKey);
  const { data } = await supabase
    .from('admins')
    .select('username')
    .eq('username', username)
    .eq('password', password)
    .maybeSingle();

  return data ? data.username : null;
}

export default async function handler(req, res) {
  // В vercel.json на /api/* стоял s-maxage — для авторизованных ответов прокси
  // кэширование недопустимо, переопределяем всегда.
  res.setHeader('Cache-Control', 'no-store');

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const admin = await checkAuth(req, serviceKey);
  if (!admin) {
    return res.status(401).json({ error: 'Не авторизован — войдите в панель заново' });
  }

  // req.url: /api/admin-db/rest/v1/<table>?<postgrest query>
  const rawUrl = (req.url || '').replace(/^\/api\/admin-db\//, '');
  if (!rawUrl.startsWith('rest/v1/')) {
    return res.status(404).json({ error: 'Not found' });
  }

  // Реврайт Vercel (/api/admin-db/:path* -> /api/admin-db/[...path]) подмешивает
  // сматченный маршрут в query как `path=` — PostgREST принимает его за фильтр
  // по несуществующей колонке и роняет запрос. Вырезаем служебный параметр.
  const qIndex = rawUrl.indexOf('?');
  const pathPart = qIndex === -1 ? rawUrl : rawUrl.slice(0, qIndex);
  const query = new URLSearchParams(qIndex === -1 ? '' : rawUrl.slice(qIndex + 1));
  query.delete('path');
  const qs = query.toString();
  const rawPath = qs ? `${pathPart}?${qs}` : pathPart;
  const segments = pathPart.split('/').filter(Boolean); // ['rest','v1','speakers'] или ['rest','v1','rpc','send_ticket']
  const target = segments[2];

  if (target === 'rpc') {
    if (!RPC_FUNCTIONS.has(segments[3])) {
      return res.status(403).json({ error: `RPC не разрешён: ${segments[3] || ''}` });
    }
  } else {
    if (!TABLES.has(target)) {
      return res.status(403).json({ error: `Таблица не разрешена: ${target || ''}` });
    }
    // Жёсткое удаление события каскадом сносит регистрации. В мини-аппе перед
    // удалением сохраняется слепок регистраций (admin-mutations/delete_event) —
    // после истории с пропавшим мероприятием 20.08 удаление здесь закрыто.
    if (target === 'bot_events' && req.method === 'DELETE') {
      return res.status(403).json({
        error: 'Удаление событий — только через мини-апп (там перед удалением сохраняется слепок регистраций)',
      });
    }
  }

  const headers = {
    apikey: serviceKey,
    authorization: `Bearer ${serviceKey}`,
  };
  for (const name of FORWARD_REQUEST_HEADERS) {
    if (req.headers[name]) headers[name] = req.headers[name];
  }

  const hasBody = !['GET', 'HEAD'].includes(req.method || 'GET');
  let body;
  if (hasBody && req.body !== undefined && req.body !== null && req.body !== '') {
    // Vercel уже распарсил JSON — сериализуем обратно для PostgREST
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  }

  let upstream;
  try {
    upstream = await fetch(`${SUPABASE_URL}/${rawPath}`, {
      method: req.method,
      headers,
      body,
    });
  } catch (e) {
    console.error('[admin-db] upstream error:', e);
    return res.status(502).json({ error: 'Upstream error' });
  }

  res.status(upstream.status);
  for (const name of FORWARD_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) res.setHeader(name, value);
  }
  res.setHeader('Cache-Control', 'no-store');

  const text = await upstream.text();
  return res.send(text);
}
