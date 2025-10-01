// functions/api/auth/callback.js
// 接收 Google 帶回來的 code，交換 token，建立 session cookie，導回首頁

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const err = url.searchParams.get("error");

  if (err) {
    return new Response(`OAuth error: ${err}`, { status: 400 });
  }
  if (!code) return new Response("Missing code", { status: 400 });
  if (!state) return new Response("Missing state", { status: 400 });

  // 1) 驗證 state（CSRF 防護）
  const cookie = request.headers.get("Cookie") || "";
  const stateCookie = cookie.split("; ").find((r) => r.startsWith("oauth_state="));
  const savedState = stateCookie?.split("=")[1];
  if (!savedState || savedState !== state) {
    return new Response("Invalid state", { status: 400 });
  }

  // 2) 計算 redirectUri（必須與 login.js 使用一致）
  const reqUrl = new URL(request.url);
  const baseUrl =
    (env.BASE_URL && env.BASE_URL.trim()) || `${reqUrl.protocol}//${reqUrl.host}`;
  const redirectUri = `${baseUrl}/api/auth/callback`;

  // 3) 以 code 向 Google 交換 token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const t = await tokenRes.text();
    return new Response(`Token error: ${t}`, { status: 500 });
  }

  const token = await tokenRes.json();
  // token 內含 access_token / id_token / refresh_token (視 prompt/consent 而定)

  // 4) （可選）你也可用 access_token 取得 userinfo
  // const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
  //   headers: { Authorization: `Bearer ${token.access_token}` }
  // });
  // const user = await userRes.json();

  // 5) 建立 session（簡化：把 id_token 當作 payload 並加 HMAC 簽名）
  //    實務中可改成你自己的 session 資料（例如 user id）再簽名或存入 D1 / KV。
  const payload = token.id_token;

  // HMAC-SHA256 簽名
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuf = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));

  const sessionCookie = [
    `session=${encodeURIComponent(payload)}.${sigB64}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=None",
    "Max-Age=604800", // 7 days
  ].join("; ");

  // 清掉 state cookie
  const clearState =
    "oauth_state=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=None";

  // 6) 導回首頁（或改成 /admin 之類）
  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie": sessionCookie,
      "Set-Cookie": clearState,
      Location: baseUrl + "/",
    },
  });
}
