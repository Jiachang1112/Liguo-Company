// functions/_middleware.js
// Middleware: 保護後台頁面，其他頁面不受影響。
// 只攔截 /admin.html，若沒登入會導向 /api/auth/login

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  try {
    // 只針對 /admin.html 做檢查
    if (url.pathname === "/admin.html") {
      const cookie = request.headers.get("Cookie") || "";
      const session = cookie.split("; ").find(row => row.startsWith("session="));

      if (!session) {
        // 沒有登入 → 導向登入
        return Response.redirect("/api/auth/login", 302);
      }
    }

    // 其他頁面正常繼續
    return await next();
  } catch (err) {
    // 錯誤處理，避免 Worker 崩潰
    console.error("Middleware error:", err);
    return new Response("Something went wrong", { status: 500 });
  }
}
