export async function onRequestPost({ request, env }) {
  const { orderNo, status } = await request.json();
  const ALLOWED = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"];
  if (!orderNo || !ALLOWED.includes(status)) {
    return new Response(JSON.stringify({ error: "invalid payload" }), { status: 400 });
  }
  await env.DB.prepare("UPDATE orders SET status=? WHERE orderNo=?").bind(status, orderNo).run();
  return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
}
