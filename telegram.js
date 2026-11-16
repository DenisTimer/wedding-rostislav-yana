// Server-side only. Credentials are supplied as runtime secrets.
export async function notifyTelegram(record, env, requestFetch = fetch) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) throw new Error('Telegram is not configured');
  const text = [
    '💌 Новая анкета на свадьбу',
    '',
    'Гость / семья: ' + record.name,
    'Участие: ' + (record.attendance === 'yes' ? 'Придут ✅' : 'Не смогут'),
    record.allergies ? 'Аллергии: ' + record.allergies : '',
    record.songs?.length ? 'Песни:\n' + record.songs.join('\n') : '',
    record.wishes ? 'Пожелания: ' + record.wishes : '',
    '',
    'Анкета: ' + record.id,
  ].filter(line => line !== '').join('\n');
  const response = await requestFetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendMessage', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    signal: AbortSignal.timeout(15000),
    body: JSON.stringify({chat_id: env.TELEGRAM_CHAT_ID, text, link_preview_options: {is_disabled: true}}),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error('Telegram delivery failed');
  return result.result.message_id;
}
