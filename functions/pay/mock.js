export async function onRequestGet({ request }) {
  const { searchParams } = new URL(request.url);
  const orderNo = searchParams.get("orderNo");
  const amt = searchParams.get("amt");
  return new Response(`<!doctype html><meta charset="utf-8">
  <body style="font-family:system-ui;padding:24px">
    <h3>模擬金流頁面</h3>
    <p>訂單：${orderNo}</p><p>金額：NT$ ${amt}</p>
    <form method="POST" action="/pay/mock-return">
      <input type="hidden" name="orderNo" value="${orderNo}">
      <button style="padding:8px 12px">模擬付款成功</button>
    </form>
  </body>`, { headers: { "Content-Type": "text/html; charset=utf-8" }});
}
