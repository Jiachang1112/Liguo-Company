// functions/api/auth/me.js
export async function onRequestGet(context) {
  const { request } = context;
  const cookie = request.headers.get("Cookie") || "";
  const session = cookie
    .split("; ")
    .find((row) => row.startsWith("session="));

  if (!session) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 假設 callback.js 把 { name, email, exp } base64 存在 session cookie
  try {
    const encoded = session.split("=")[1] || "";
    const json = atob(encoded);
    const user = JSON.parse(json);

    // 可選：檢查是否過期
    if (user.exp && Date.now() > user.exp) {
      return new Response(JSON.stringify({ error: "expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ name: user.name, email: user.email }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "bad session" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
