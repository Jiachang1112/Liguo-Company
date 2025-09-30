export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT sku,name,price,image FROM products WHERE active=1"
  ).all();
  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" }
  });
}
