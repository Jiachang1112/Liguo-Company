export async function onRequestGet({ env, request }) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) return new Response('Missing code', { status: 400 });

    const redirectUri = `${env.BASE_URL}/api/auth/callback`;

    // 1) 換 token
    const body = new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!tokenRes.ok) {
      const t = await tokenRes.text();
      console.error('token error:', t);
      return new Response('Token exchange failed', { status: 500 });
    }

    const tokens = await tokenRes.json(); // { id_token, access_token, ... }

    // 2) 解析使用者（從 id_token 的 payload）
    const payload = JSON.parse(atob(tokens.id_token.split('.')[1]));
    const email    = payload.email || '';
    const name     = payload.name  || '';
    const googleId = payload.sub;

    // 3) D1（可選；未建表可先跳過）
    // CREATE TABLE IF NOT EXISTS users
    // (id INTEGER PRIMARY KEY, email TEXT UNIQUE, name TEXT, google_id TEXT UNIQUE, last_login TEXT);
    try {
      await env.DB
        .prepare('INSERT OR IGNORE INTO users (email, name, google_id, last_login) VALUES (?, ?, ?, datetime("now"))')
        .bind(email, name, googleId)
        .run();

      await env.DB
        .prepare('UPDATE users SET last_login = datetime("now") WHERE email = ?')
        .bind(email)
        .run();
    } catch (e) {
      console.error('D1 error:', e);
    }

    // 4) 設置 session cookie（簡單示範）
    const cookie = [
      `session=${tokens.id_token}`,
      'Path=/',
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      'Max-Age=2592000',
    ].join('; ');

    return new Response(null, {
      status: 302,
      headers: {
        'Set-Cookie': cookie,
        'Location': '/',
      },
    });
  } catch (err) {
    console.error(err);
    return new Response('Auth error', { status: 500 });
  }
}
