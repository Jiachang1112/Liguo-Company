export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  const cookie = request.headers.get("Cookie") || "";
  const session = cookie.split("; ").find(row => row.startsWith("session="));

  if (!session && !url.pathname.startsWith("/api/auth")) {
    return Response.redirect("/api/auth/login", 302);
  }

  return await context.next();
}
