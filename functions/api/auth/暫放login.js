// functions/api/auth/logout.js
/**
 * Handle logout
 * - Clears the session cookie
 * - Redirects back to homepage
 */

export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url);

  // 建立一個已過期的 cookie 來清除 session
  const clearCookie = [
    "session=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];

  // 登出後導回首頁
  return new Response(null, {
    status: 302,
    headers: {
      "Set-Cookie": clearCookie,
      Location: url.origin, // 回到首頁
    },
  });
}
