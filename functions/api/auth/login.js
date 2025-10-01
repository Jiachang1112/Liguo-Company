export async function onRequestGet({ env }) {
  const state = crypto.randomUUID();
  const redirectUri = `${env.BASE_URL}/api/auth/callback`;

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.search = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  }).toString();

  return Response.redirect(url.toString(), 302);
}
