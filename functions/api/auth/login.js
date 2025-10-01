export async function onRequestGet() {
  const redirectUri = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: "https://liguo-company.pages.dev/api/auth/callback",
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent"
  });

  return Response.redirect(`${redirectUri}?${params.toString()}`, 302);
}
