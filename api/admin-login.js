import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ndpkxustvcijykzxqxrn.supabase.co';

/**
 * Вход в админку. Проверка логина/пароля выполняется здесь, сервисным ключом:
 * раньше панель сверяла пароль SELECT'ом из браузера, для чего таблица admins
 * (с паролями открытым текстом) была читаема публичным anon-ключом. После
 * перевода панели на этот эндпоинт публичное чтение admins отозвано.
 */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing credentials' });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const supabase = createClient(SUPABASE_URL, serviceKey);
  const { data, error } = await supabase
    .from('admins')
    .select('username')
    .eq('username', username)
    .eq('password', password)
    .maybeSingle();

  if (error) {
    console.error('[admin-login] DB error:', error.message);
    return res.status(500).json({ error: 'Internal error' });
  }

  if (!data) {
    // Лёгкий тормоз против перебора
    await new Promise((r) => setTimeout(r, 400));
    return res.status(401).json({ error: 'Неверное имя пользователя или пароль' });
  }

  return res.status(200).json({ ok: true, username: data.username });
}
