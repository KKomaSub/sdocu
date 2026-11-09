// Cloudflare Pages Function. All matchmaking state lives in the MATCH_DB D1 binding.
// This endpoint is never used for friend-code invitations. Game data travels via WebRTC.
const DEFAULT_TTL = 45000;
const PAIRED_TTL = 120000;
const VALID_PEER = /^[A-Za-z0-9_-]{3,100}$/;
const VALID_TOKEN = /^[0-9a-f]{8}-[0-9a-f-]{27,40}$/i;

function json(data, status = 200) {
  return Response.json(data, { status, headers: {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  } });
}
function ensureOrigin(request) {
  const origin = request.headers.get('Origin');
  return !origin || origin === new URL(request.url).origin;
}
async function init(db) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS sudoku_match_queue (
    token TEXT PRIMARY KEY,
    peer_id TEXT NOT NULL UNIQUE,
    player_name TEXT NOT NULL,
    state TEXT NOT NULL,
    matched_token TEXT,
    matched_peer_id TEXT,
    matched_name TEXT,
    role TEXT,
    room TEXT,
    host_ready INTEGER NOT NULL DEFAULT 0,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )`).run();
  await db.prepare('CREATE INDEX IF NOT EXISTS sudoku_match_waiting_idx ON sudoku_match_queue (state, expires_at)').run();
}
async function expire(db, now) {
  await db.prepare('DELETE FROM sudoku_match_queue WHERE expires_at < ?').bind(now).run();
}
function asPair(row) {
  return { type: 'pair', role: row.role, peerId: row.matched_peer_id, name: row.matched_name, room: row.room };
}
async function join(db, body) {
  const peerId = typeof body?.peerId === 'string' ? body.peerId : '';
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 20) : '';
  if (!VALID_PEER.test(peerId)) return json({ error: '유효하지 않은 연결 ID입니다.' }, 400);
  const now = Date.now();
  await expire(db, now);
  // Reject duplicate peer IDs while a currently connected caller has a valid lease.
  const exists = await db.prepare('SELECT token FROM sudoku_match_queue WHERE peer_id = ?').bind(peerId).first();
  if (exists) return json({ error: '이미 대기열에 등록된 연결입니다.' }, 409);
  const token = crypto.randomUUID();
  const nickname = name || '플레이어';
  for (let tries = 0; tries < 5; tries++) {
    const candidate = await db.prepare(`SELECT token, peer_id, player_name FROM sudoku_match_queue
      WHERE state='waiting' AND peer_id<>? AND expires_at>? ORDER BY RANDOM() LIMIT 1`)
      .bind(peerId, now).first();
    if (!candidate) break;
    const room = crypto.randomUUID();
    // Compare-and-swap prevents two newcomers from claiming one waiting player.
    const claimed = await db.prepare(`UPDATE sudoku_match_queue SET
      state='paired', role='host', matched_token=?, matched_peer_id=?, matched_name=?, room=?, host_ready=0, expires_at=?
      WHERE token=? AND state='waiting' AND expires_at>? RETURNING token`)
      .bind(token, peerId, nickname, room, now + PAIRED_TTL, candidate.token, now).first();
    if (!claimed) continue;
    try {
      await db.prepare(`INSERT INTO sudoku_match_queue
        (token,peer_id,player_name,state,matched_token,matched_peer_id,matched_name,role,room,expires_at,created_at)
        VALUES (?,?,?,'paired',?,?,?,'guest',?,?,?)`)
        .bind(token, peerId, nickname, candidate.token, candidate.peer_id, candidate.player_name, room, now + PAIRED_TTL, now).run();
    } catch (error) {
      // Restore a claimed host when the guest could not be inserted.
      await db.prepare(`UPDATE sudoku_match_queue SET state='waiting', role=NULL,
        matched_token=NULL,matched_peer_id=NULL,matched_name=NULL,room=NULL,expires_at=?
        WHERE token=? AND matched_token=? AND state='paired'`)
        .bind(now + DEFAULT_TTL, candidate.token, token).run();
      throw error;
    }
    // The guest waits for the host to register the match before connecting by WebRTC.
    return json({ type: 'waiting', token });
  }
  await db.prepare(`INSERT INTO sudoku_match_queue
    (token,peer_id,player_name,state,expires_at,created_at)
    VALUES (?,?,?,'waiting',?,?)`)
    .bind(token, peerId, nickname, now + DEFAULT_TTL, now).run();
  return json({ type: 'waiting', token });
}
async function status(db, token) {
  if (!VALID_TOKEN.test(token)) return json({ error: '잘못된 대기열 토큰입니다.' }, 400);
  const now = Date.now();
  const row = await db.prepare('SELECT * FROM sudoku_match_queue WHERE token=? AND expires_at>?')
    .bind(token, now).first();
  if (!row) return json({ error: '대기열 등록이 만료되었습니다.' }, 410);
  if (row.state === 'paired') {
    if (row.role === 'host') {
      await db.prepare("UPDATE sudoku_match_queue SET host_ready=1 WHERE token=? AND state='paired'")
        .bind(token).run();
      return json(asPair(row));
    }
    const host = await db.prepare("SELECT host_ready FROM sudoku_match_queue WHERE token=? AND state='paired' AND matched_token=?")
      .bind(row.matched_token, token).first();
    if (!host?.host_ready) return json({ type: 'waiting' });
    return json(asPair(row));
  }
  await db.prepare("UPDATE sudoku_match_queue SET expires_at=? WHERE token=? AND state='waiting'")
    .bind(now + DEFAULT_TTL, token).run();
  return json({ type: 'waiting' });
}
async function leave(db, token) {
  if (!VALID_TOKEN.test(token)) return json({ error: '잘못된 대기열 토큰입니다.' }, 400);
  const row = await db.prepare('SELECT * FROM sudoku_match_queue WHERE token=?').bind(token).first();
  if (row?.state === 'paired' && row.matched_token) {
    await db.prepare(`UPDATE sudoku_match_queue SET state='waiting', role=NULL,
      matched_token=NULL, matched_peer_id=NULL, matched_name=NULL, room=NULL, expires_at=?
      WHERE token=? AND state='paired' AND matched_token=?`)
      .bind(Date.now() + DEFAULT_TTL, row.matched_token, token).run();
  }
  await db.prepare('DELETE FROM sudoku_match_queue WHERE token=?').bind(token).run();
  return json({ ok: true });
}
async function handler(context) {
  const { request, env } = context;
  if (!ensureOrigin(request)) return json({ error: '요청 출처가 일치하지 않습니다.' }, 403);
  if (!env.MATCH_DB) return json({ error: 'Cloudflare D1 바인딩 MATCH_DB가 필요합니다.', code: 'DB_NOT_CONFIGURED' }, 503);
  try {
    const db = env.MATCH_DB;
    await init(db);
    if (request.method === 'GET') {
      const u = new URL(request.url);
      if (u.searchParams.get('health') === '1') return json({ ok: true, service: 'sudoku-pages-matchmaker' });
      return status(db, u.searchParams.get('token') || '');
    }
    if (request.method === 'POST') {
      if (Number(request.headers.get('content-length') || 0) > 2048) return json({ error: '요청 크기 초과' }, 413);
      let data;
      try { data = await request.json(); } catch { return json({ error: 'JSON 형식이 올바르지 않습니다.' }, 400); }
      if (data?.action === 'join') return join(db, data);
      if (data?.action === 'leave') return leave(db, data.token);
      return json({ error: '지원하지 않는 요청입니다.' }, 400);
    }
    return json({ error: '지원하지 않는 메서드입니다.' }, 405);
  } catch (error) {
    console.error('Matchmaking D1 error', error);
    return json({ error: '매칭 서버에서 오류가 발생했습니다.', code: 'MATCH_SERVER_ERROR' }, 500);
  }
}
export const onRequestGet = handler;
export const onRequestPost = handler;