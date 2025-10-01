// functions/_middleware.js
export async function onRequest(context) {
  const { request, next } = context;

  try {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1) API 路由絕對放行（避免攔截造成迴圈）
    if (pathname.startsWith('/api/')) {
      return next();
    }

    // 2) 常見靜態資源一律放行
    const staticExts = [
      '.css', '.js', '.mjs', '.map',
      '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
      '.woff', '.woff2', '.ttf', '.eot',
      '.txt', '.xml', '.json', '.pdf'
    ];
    if (staticExts.some(ext => pathname.endsWith(ext))) {
      return next();
    }

    // 3) 只有 /admin.html 需要登入；其他頁面先全部放行，之後再逐步收緊
    if (pathname === '/admin.html') {
      const cookie = request.headers.get('Cookie') || '';
      const hasSession = cookie
        .split(';')
        .some(v => v.trim().startsWith('session='));
      if (!hasSession) {
        // 未登入導向登入流程
        return Response.redirect('/api/auth/login', 302);
      }
    }

    // 4) 其它頁面照常處理
    return next();

  } catch (err) {
    // 絕不讓 Worker crash：回一般 200/OK（或你要回檔案、重導都可）
    // 這裡回最保守的 OK，確保不出 1101
    return new Response('OK', { status: 200 });
  }
}
