// Short-lived friend-room announcements scoped to the Cloudflare-observed network.
const LEASE_TIME = 35000;
const validLease = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

function json(value, status = 200) {
  return Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
}
function networkPrefix(ip) {
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip)) return ip;
  if (!/^[\da-f:]+$/i.test(ip) || !ip.includes(':')) return '';
  try {
    // Standardize equivalent IPv6 spellings before grouping privacy addresses by /64.
    const hostname = new URL('https://[' + ip + ']').hostname.slice(1, -1);
    const [head, tail] = hostname.split('::');
    const before = head ? head.split(':') : [];
    if (tail === undefined) return before.slice(0, 4).join(':');
    const after = tail ? tail.split(':') : [];
    return [...before, ...Array(8 - before.length - after.length).fill('0'), ...after].slice(0, 4).join(':');
  } catch {
    return '';
  }
}
async function networkKey(db, prefix) {
  await db.prepare('CREATE TABLE IF NOT EXISTS sudoku_nearby_key (id INTEGER PRIMARY KEY, secret TEXT NOT NULL)').run();
  let row = await db.prepare('SELECT secret FROM sudoku_nearby_key WHERE id=1').first();
  if (!row) {
    await db.prepare('INSERT OR IGNORE INTO sudoku_nearby_key (id, secret) VALUES (1, ?)').bind(crypto.randomUUID()).run();
    row = await db.prepare('SELECT secret FROM sudoku_nearby_key WHERE id=1').first();
  }
  const bytes = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', bytes.encode(row.secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC', key, bytes.encode(prefix))), byte => byte.toString(16).padStart(2, '0')).join('');
}
async function handler({ request, env }) {
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ nearby: false }, 403);
  const db = env.MATCH_DB;
  const prefix = networkPrefix(request.headers.get('CF-Connecting-IP') || '');
  if (!db || !prefix) return json({ nearby: false }, 503);
  try {
    let data;
    if (request.method === 'POST') {
      const body = await request.text();
      if (body.length > 256) return json({ ok: false }, 413);
      try { data = JSON.parse(body); } catch { return json({ ok: false }, 400); }
      if (typeof data?.lease !== 'string' || !validLease.test(data.lease) || !['publish', 'close'].includes(data.action)) {
        return json({ ok: false }, 400);
      }
    }
    const key = await networkKey(db, prefix);
    await db.prepare(`CREATE TABLE IF NOT EXISTS sudoku_nearby_rooms (
      network TEXT NOT NULL,
      lease TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      PRIMARY KEY (network, lease)
    )`).run();
    await db.prepare('CREATE INDEX IF NOT EXISTS sudoku_nearby_expiry ON sudoku_nearby_rooms (expires_at)').run();
    const now = Date.now();
    if (!data) {
      const room = await db.prepare('SELECT 1 AS found FROM sudoku_nearby_rooms WHERE network=? AND expires_at>? LIMIT 1').bind(key, now).first();
      return json({ nearby: Boolean(room) });
    }
    if (data.action === 'close') {
      await db.prepare('DELETE FROM sudoku_nearby_rooms WHERE network=? AND lease=?').bind(key, data.lease).run();
    } else {
      await db.batch([
        db.prepare('DELETE FROM sudoku_nearby_rooms WHERE expires_at<=?').bind(now),
        db.prepare(`INSERT INTO sudoku_nearby_rooms (network, lease, expires_at) VALUES (?, ?, ?)
          ON CONFLICT(network, lease) DO UPDATE SET expires_at=excluded.expires_at`).bind(key, data.lease, now + LEASE_TIME),
      ]);
    }
    return json({ ok: true });
  } catch (error) {
    console.error('Nearby room database error', error);
    return json({ nearby: false }, 500);
  }
}

export const onRequestGet = handler;
export const onRequestPost = handler;
