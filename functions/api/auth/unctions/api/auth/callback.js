export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("No code received", { status: 400 });
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: "https://liguo-company.pages.dev/api/auth/callback"
    })
  });

  const tokens = await tokenRes.json();
  return new Response(JSON.stringify(tokens, null, 2), {
    headers: { "Content-Type": "application/json" }
  });
}
