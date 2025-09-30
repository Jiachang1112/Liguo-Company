# Liguo-Company (Cloudflare Pages + Functions + D1)

這是立國實業商店的最小可行版本（MVP）骨架：前端在 `public/`，API 在 `functions/`，資料表 schema 與種子資料在根目錄的 `schema.sql`、`seed.sql`。

## 上線步驟（摘要）
1. 將此專案推到 GitHub（repo 名稱建議 `Liguo-Company`）。
2. Cloudflare → Pages → Connect to Git，設定：
   - Framework preset: None
   - Build command: （空白）
   - Build output directory: `public`
3. Cloudflare → D1 建資料庫（如 `liguo-shop-db`）。
4. 回 Pages 專案 Settings → Functions → D1 bindings：新增 Binding `DB` 指向該資料庫。
5. Pages 專案 → Functions → D1 (Data) → 執行 `schema.sql`，再執行 `seed.sql`。
6. 前端網址：`/shop/index.html`，後台：`/admin.html`。

## 之後可做
- 串正式金流（綠界/藍新）→ 在 `functions/pay/` 新增對應路由與驗章。
- 擴充後台、登入、出貨狀態、CSV 匯出、電子發票、店到店物流等。
