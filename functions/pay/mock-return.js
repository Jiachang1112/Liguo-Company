export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const orderNo = form.get("orderNo");
  await env.DB.prepare("UPDATE orders SET status='PAID' WHERE orderNo=?").bind(orderNo).run();
  return new Response(`<!doctype html><meta charset="utf-8">
  <h3>付款成功</h3><a href="/shop/index.html">回商店</a>`,
  { headers:{ "Content-Type":"text/html; charset=utf-8" }});
}
