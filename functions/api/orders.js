function calcTotals(items){
  const subtotal = items.reduce((s,i)=> s + i.price*i.qty, 0);
  const shipping = (subtotal > 2000 || subtotal === 0) ? 0 : 100;
  return { subtotal, shipping, total: subtotal + shipping };
}

export async function onRequestPost({ request, env }) {
  const { customer, items } = await request.json();
  if(!items?.length) return new Response(JSON.stringify({error:"空的購物車"}), {status:400});
  if(!customer?.name || !customer?.phone || !customer?.email)
    return new Response(JSON.stringify({error:"缺少客戶資料"}), {status:400});

  const orderNo = "LIGUO" + Date.now().toString().slice(-10);
  const { subtotal, shipping, total } = calcTotals(items);
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO orders(orderNo,name,phone,email,shipping,address,payment,note,subtotal,shippingFee,total,status,createdAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).bind(
    orderNo, customer.name, customer.phone, customer.email, customer.shipping, customer.address,
    customer.payment, customer.note||"", subtotal, shipping, total, "PENDING", now
  ).run();

  const stmt = await env.DB.prepare("INSERT INTO order_items(orderNo,sku,name,price,qty) VALUES (?,?,?,?,?)");
  for (const it of items) {
    await stmt.bind(orderNo, it.sku, it.name, it.price, it.qty).run();
  }

  if (customer.payment?.includes("信用卡")) {
    const url = new URL("/pay/mock", request.url);
    url.searchParams.set("orderNo", orderNo);
    url.searchParams.set("amt", total);
    return new Response(JSON.stringify({ orderNo, next: url.toString() }), { headers:{ "Content-Type":"application/json" }});
  }

  return new Response(JSON.stringify({ orderNo }), { headers:{ "Content-Type":"application/json" }});
}
