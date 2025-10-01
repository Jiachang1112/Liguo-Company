export async function onRequest(context) {
  const url = new URL(context.request.url);

  // 只放行 /api/auth/* 給各自 handler；其餘回到靜態檔案
  if (url.pathname.startsWith('/api/auth/')) {
    return context.next();
  }

  // 重要：否則首頁、資源會被你的 handler 攔走 → 1101
  return context.env.ASSETS.fetch(context.request);
}
