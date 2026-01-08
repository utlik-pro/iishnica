import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ndpkxustvcijykzxqxrn.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BOT_TOKEN = "8234859307:AAFjLWiY4DCZOnHBIJHS_V72mrMWoHqim4c";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userTgId, matchName, matchedUserId, userId } = req.body;

    if (!userTgId || !matchName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    const text = `🤝 *Новый контакт!*\n\n${matchName} тоже хочет познакомиться.\n\nНачните общение! 👋`;

    // Send Telegram notification
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: userTgId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{
            text: '👋 Открыть контакты',
            web_app: { url: 'https://maincomby-miniapp.onrender.com/?screen=matches' }
          }]]
        }
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      console.error('Telegram error:', result);
      return res.status(500).json({ error: 'Failed to send Telegram message', details: result });
    }

    // Create in-app notification if userId provided
    if (userId) {
      await supabase.from('app_notifications').insert({
        user_id: userId,
        type: 'match',
        title: 'Новый контакт!',
        message: `${matchName} тоже хочет познакомиться. Начните общение!`,
        data: { matchedUserId },
        is_read: false,
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
