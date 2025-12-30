// Import bot data from SQLite to Supabase
// Run from iishnica directory: node import_bot_data.js

const { createClient } = require('@supabase/supabase-js');
const Database = require('better-sqlite3');

const SUPABASE_URL = 'https://ndpkxustvcijykzxqxrn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SBb7mMchz99ZIfoPgnxQDQ_bbQpePNZ';
const SQLITE_PATH = '/Users/admin/maincomby_bot/bot.db';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
    console.log('=== Bot Data Migration ===\n');

    const db = new Database(SQLITE_PATH, { readonly: true });

    // 1. Migrate Users
    console.log('Migrating users...');
    const users = db.prepare('SELECT * FROM users').all();

    let userCount = 0;
    for (const user of users) {
        const { error } = await supabase.from('bot_users').upsert({
            id: user.id,
            tg_user_id: user.tg_user_id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
            phone_number: user.phone_number,
            first_seen_at: user.first_seen_at,
            points: user.points || 0,
            warns: user.warns || 0,
            banned: Boolean(user.banned),
            source: user.source,
            utm_source: user.utm_source,
            utm_medium: user.utm_medium,
            utm_campaign: user.utm_campaign,
            referrer: user.referrer
        }, { onConflict: 'tg_user_id' });

        if (!error) userCount++;
        else console.log(`  Error user ${user.tg_user_id}: ${error.message}`);
    }
    console.log(`  Migrated ${userCount}/${users.length} users\n`);

    // 2. Migrate Events
    console.log('Migrating events...');
    const events = db.prepare('SELECT * FROM events').all();

    let eventCount = 0;
    for (const event of events) {
        const { error } = await supabase.from('bot_events').upsert({
            id: event.id,
            title: event.title,
            description: event.description,
            event_date: event.event_date,
            city: event.city || 'Минск',
            location: event.location,
            location_url: event.location_url,
            speakers: event.speakers,
            max_participants: event.max_participants,
            registration_deadline: event.registration_deadline,
            is_active: Boolean(event.is_active),
            created_at: event.created_at,
            created_by: event.created_by
        }, { onConflict: 'id' });

        if (!error) eventCount++;
        else console.log(`  Error event ${event.title}: ${error.message}`);
    }
    console.log(`  Migrated ${eventCount}/${events.length} events\n`);

    // 3. Migrate Registrations
    console.log('Migrating registrations...');
    const registrations = db.prepare('SELECT * FROM event_registrations').all();

    let regCount = 0;
    for (const reg of registrations) {
        const { error } = await supabase.from('bot_registrations').upsert({
            id: reg.id,
            event_id: reg.event_id,
            user_id: reg.user_id,
            registered_at: reg.registered_at,
            status: reg.status || 'registered',
            notes: reg.notes,
            registration_version: reg.registration_version || 'new_date',
            confirmed: Boolean(reg.confirmed),
            confirmation_requested_at: reg.confirmation_requested_at,
            reminder_sent: Boolean(reg.reminder_sent),
            reminder_sent_at: reg.reminder_sent_at
        }, { onConflict: 'id' });

        if (!error) regCount++;
    }
    console.log(`  Migrated ${regCount}/${registrations.length} registrations\n`);

    // 4. Migrate Feedback
    console.log('Migrating feedback...');
    const feedback = db.prepare('SELECT * FROM event_feedback').all();

    let fbCount = 0;
    for (const fb of feedback) {
        const { error } = await supabase.from('bot_feedback').upsert({
            id: fb.id,
            event_id: fb.event_id,
            user_id: fb.user_id,
            speaker1_rating: fb.speaker1_rating,
            speaker2_rating: fb.speaker2_rating,
            comment: fb.comment,
            interested_topics: fb.interested_topics,
            created_at: fb.created_at
        }, { onConflict: 'id' });

        if (!error) fbCount++;
    }
    console.log(`  Migrated ${fbCount}/${feedback.length} feedback\n`);

    // 5. Migrate Profiles
    console.log('Migrating profiles...');
    const profiles = db.prepare('SELECT * FROM user_profiles').all();

    let profCount = 0;
    for (const p of profiles) {
        const { error } = await supabase.from('bot_profiles').upsert({
            id: p.id,
            user_id: p.user_id,
            bio: p.bio,
            occupation: p.occupation,
            looking_for: p.looking_for,
            can_help_with: p.can_help_with,
            needs_help_with: p.needs_help_with,
            photo_file_id: p.photo_file_id,
            city: p.city || 'Минск',
            moderation_status: p.moderation_status || 'pending',
            is_visible: Boolean(p.is_visible),
            created_at: p.created_at,
            updated_at: p.updated_at
        }, { onConflict: 'user_id' });

        if (!error) profCount++;
    }
    console.log(`  Migrated ${profCount}/${profiles.length} profiles\n`);

    // 6. Migrate Questions
    console.log('Migrating questions...');
    const questions = db.prepare('SELECT * FROM questions').all();

    let qCount = 0;
    for (const q of questions) {
        const { error } = await supabase.from('bot_questions').upsert({
            id: q.id,
            user_id: q.user_id,
            username: q.username,
            chat_id: q.chat_id,
            message_id: q.message_id,
            question_text: q.question_text,
            answer_text: q.answer_text,
            question_type: q.question_type || 'reply',
            answered: Boolean(q.answered),
            created_at: q.created_at,
            answered_at: q.answered_at
        }, { onConflict: 'id' });

        if (!error) qCount++;
    }
    console.log(`  Migrated ${qCount}/${questions.length} questions\n`);

    // 7. Migrate Security Logs
    console.log('Migrating security logs...');
    const logs = db.prepare('SELECT * FROM security_logs').all();

    let logCount = 0;
    for (const log of logs) {
        const { error } = await supabase.from('bot_security_logs').upsert({
            id: log.id,
            user_id: log.user_id,
            username: log.username,
            chat_id: log.chat_id,
            attack_type: log.attack_type || 'prompt_injection',
            user_input: log.user_input,
            detection_reason: log.detection_reason,
            action_taken: log.action_taken,
            created_at: log.created_at
        }, { onConflict: 'id' });

        if (!error) logCount++;
    }
    console.log(`  Migrated ${logCount}/${logs.length} security logs\n`);

    // 8. Migrate Swipes
    console.log('Migrating swipes...');
    const swipes = db.prepare('SELECT * FROM swipes').all();

    let swipeCount = 0;
    for (const s of swipes) {
        const { error } = await supabase.from('bot_swipes').upsert({
            id: s.id,
            swiper_id: s.swiper_id,
            swiped_id: s.swiped_id,
            action: s.action,
            swiped_at: s.swiped_at
        }, { onConflict: 'id' });

        if (!error) swipeCount++;
    }
    console.log(`  Migrated ${swipeCount}/${swipes.length} swipes\n`);

    // 9. Migrate Matches
    console.log('Migrating matches...');
    const matches = db.prepare('SELECT * FROM matches').all();

    let matchCount = 0;
    for (const m of matches) {
        const { error } = await supabase.from('bot_matches').upsert({
            id: m.id,
            user1_id: m.user1_id,
            user2_id: m.user2_id,
            matched_at: m.matched_at,
            is_active: Boolean(m.is_active)
        }, { onConflict: 'id' });

        if (!error) matchCount++;
    }
    console.log(`  Migrated ${matchCount}/${matches.length} matches\n`);

    db.close();
    console.log('=== Migration Complete! ===');
}

migrate().catch(console.error);
