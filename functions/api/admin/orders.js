export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT orderNo,name,phone,email,total,status,createdAt FROM orders ORDER BY id DESC LIMIT 200"
  ).all();
  return new Response(JSON.stringify(results), { headers:{ "Content-Type":"application/json" }});
}
