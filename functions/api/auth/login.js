// functions/api/auth/login.js
/**
 * Redirect user to Google OAuth consent screen.
 * - Generates a CSRF "state" value and stores it in a Secure, HttpOnly cookie
 * - Builds the Google OAuth URL and redirects
 *
 * Required env:
 *   - GOOGLE_CLIENT_ID
 *   - BASE_URL (fallback to request origin if missing)
 */
export async function onRequestGet(context) {
  const { request, env } = context;

  // --- base URL (for callback) ---
  const reqUrl = new URL(request.url);
  const baseUrl = (env.BASE_URL && env.BASE_URL.trim()) || `${reqUrl.protocol}//${reqUrl.host}`;
  const redirectUri = `${baseUrl}/api/auth/callback`;

  // --- generate a random state and store it in cookie for CSRF protection ---
  const state = base64UrlEncode(crypto.getRandomValues(new Uint8Array(16)));
  const stateCookie = [
    `oauth_state=${state}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    "Max-Age=600" // 10 minutes
  ].join("; ");

  // --- scopes you need (email + profile + openid) ---
  const scope = "openid email profile";

  // --- build the Google OAuth consent URL ---
  const googleAuth = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuth.searchParams.set("client_id", env.GOOGLE_CLIENT_ID);
  googleAuth.searchParams.set("redirect_uri", redirectUri);
  googleAuth.searchParams.set("response_type", "code");
  googleAuth.searchParams.set("scope", scope);
  googleAuth.searchParams.set("access_type", "offline");           // get refresh_token on first consent
  googleAuth.searchParams.set("include_granted_scopes", "true");   // reuse previous consent
  googleAuth.searchParams.set("state", state);
  // 可選：每次都強制出現同意畫面
  // googleAuth.searchParams.set("prompt", "consent");

  // --- redirect with Set-Cookie(state) ---
  const headers = new Headers({
    Location: googleAuth.toString(),
    "Set-Cookie": stateCookie,
  });

  return new Response(null, { status: 302, headers });
}

/** Helper: base64url encode Uint8Array */
function base64UrlEncode(bytes) {
  let str = "";
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
