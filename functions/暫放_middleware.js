// functions/_middleware.js
export async function onRequest(context) {
  const { request, next } = context;

  try {
    const url = new URL(request.url);
    const p = url.pathname || "/";

    // 允許通過的路徑（不要檔靜態檔與 API，否則會進入死循環或 throw）
    const isStatic =
      p === "/" ||
      p.startsWith("/assets/") ||
      p.startsWith("/public/") ||
      p.startsWith("/favicon") ||
      p.endsWith(".css") ||
      p.endsWith(".js") ||
      p.endsWith(".png") ||
      p.endsWith(".jpg") ||
      p.endsWith(".jpeg") ||
      p.endsWith(".ico") ||
      p.endsWith(".svg");

    const isAuthApi = p.startsWith("/api/auth/");
    const isOtherApi = p.startsWith("/api/");

    // 這些直接放行
    if (isStatic || isAuthApi || isOtherApi) {
      return await next();
    }

    // 其餘頁面才檢查 session
    const cookie = request.headers.get("Cookie") || "";
    const hasSession = cookie.split(/;\s*/).some((row) => row.startsWith("session="));

    if (!hasSession) {
      // 未登入就導向登入
      return Response.redirect(`${url.origin}/api/auth/login`, 302);
    }

    return await next();
  } catch (err) {
    // 最重要：就算出錯也不要讓整站 1101，回退為放行
    console.error("middleware error:", err);
    return await context.next();
  }
}
