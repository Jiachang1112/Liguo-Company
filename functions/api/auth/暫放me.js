// functions/api/auth/me.js
/**
 * 檢查目前登入的使用者
 * - 從 Cookie 讀取 session
 * - 如果有，就回傳使用者資訊
 * - 如果沒有，回傳未登入狀態
 */

export async function onRequestGet(context) {
  const { request } = context;
  const cookie = request.headers.get("Cookie") || "";
  const session = cookie.split("; ").find(row => row.startsWith("session="));

  if (!session) {
    return new Response(
      JSON.stringify({ error: "未登入" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // session 格式: "session=<json字串>" → 需要 decode
    const raw = decodeURIComponent(session.split("=")[1]);
    const user = JSON.parse(raw);

    return new Response(
      JSON.stringify({
        email: user.email,
        name: user.name || "",
        picture: user.picture || ""
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Session 無效" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
