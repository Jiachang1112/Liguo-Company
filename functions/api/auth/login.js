// functions/api/auth/login.js
// 產生 Google OAuth 同意頁網址並導向，順便在 cookie 設置 CSRF "state"

export async function onRequestGet(context) {
  const { request, env } = context;
  const reqUrl = new URL(request.url);

  // 1) 計算 baseUrl 與 callback URL
  const baseUrl =
    (env.BASE_URL && env.BASE_URL.trim()) || `${reqUrl.protocol}//${reqUrl.host}`;
  const redirectUri = `${baseUrl}/api/auth/callback`;

  // 2) 產生 CSRF 用的 state，放到 HttpOnly cookie
  const state = crypto.randomUUID();
  const stateCookie = [
    `oauth_state=${state}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=None",
    "Max-Age=600", // 10 minutes
  ].join("; ");

  // 3) 組 Google OAuth v2 同意頁參數
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    include_granted_scopes: "true",
    // 視需求是否要每次都跳授權畫面；若不需要可拿掉
    prompt: "consent",
  });

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  // 4) 導向 Google，同時把 state 寫入 cookie
  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie": stateCookie,
      Location: googleAuthUrl,
    },
  });
}
