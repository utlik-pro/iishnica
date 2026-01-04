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
    const { eventId, eventTitle, eventDate, eventLocation } = req.body;

    if (!eventId || !eventTitle) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('bot_users')
      .select('tg_user_id, id')
      .eq('banned', false);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const user of users || []) {
      if (!user.tg_user_id) continue;

      try {
        const text = `📅 *Новое мероприятие!*\n\n*${eventTitle}*\n\n📆 ${eventDate}\n📍 ${eventLocation || "Минск"}\n\nПриглашаем вас принять участие!`;

        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: user.tg_user_id,
            text,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{
                text: 'Подробнее',
                url: 'https://t.me/maincomapp_bot/app?startapp=events'
              }]]
            }
          }),
        });

        const result = await response.json();
        if (result.ok) {
          sentCount++;

          // Create in-app notification
          await supabase.from('app_notifications').insert({
            user_id: user.id,
            type: 'event_invitation',
            title: `Новое мероприятие: ${eventTitle}`,
            message: `${eventDate} | ${eventLocation || "Минск"}`,
            data: { event_id: eventId },
            is_read: false,
          });
        } else {
          console.error('Telegram error:', result);
          errorCount++;
        }
      } catch (e) {
        console.error('Error sending to user:', e);
        errorCount++;
      }
    }

    return res.status(200).json({
      success: true,
      sentCount,
      errorCount,
      totalUsers: users?.length || 0
    });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
