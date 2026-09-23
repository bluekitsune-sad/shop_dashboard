import { createClient } from "@libsql/client";
import { existsSync, statSync, copyFileSync, writeFileSync, readFileSync } from "node:fs";
import { join, basename } from "node:path";

const ROOT = process.cwd();
const DB = join(ROOT, "data", "shop.db");
const REPORT = join(ROOT, "_iphone_fix_report.txt");
const lines = [];
const push = (s) => lines.push(s);

push("ROOT===" + ROOT);
push("DB-EXISTS===" + existsSync(DB));
push("DB-SIZE===" + (existsSync(DB) ? statSync(DB).size : -1));

if (!existsSync(DB)) {
  push("ERR===" + "no db");
  writeFileSync(REPORT, lines.join("\n"), "utf8");
  process.exit(0);
}

// 1) Backup first — reversible
const BACKUP = join(ROOT, "data", "shop.db." + Date.now() + ".bak");
copyFileSync(DB, BACKUP);
push("BACKUP===" + basename(BACKUP));

const db = createClient({ url: "file:" + DB });

// 2) Read current state of the iphone row(s)
let before = [];
try {
  const r = db.execute({
    sql: "SELECT id, name, purchase_price, selling_price, stock_quantity FROM products WHERE LOWER(name) LIKE '%iphone%'",
  });
  before = r.rows;
} catch (e) {
  push("BEFORE-ERR===" + (e.message || e));
}
push("BEFORE===" + JSON.stringify(before));

// 3) Guarded update: only if purchase_price is the anomalous 10000000 (Rs 100,000)
let affected = 0;
try {
  const u = db.execute({
    sql: "UPDATE products SET purchase_price = 10000 WHERE LOWER(name) LIKE '%iphone%' AND purchase_price = 10000000",
  });
  affected = u.rowsAffected ?? 0;
} catch (e) {
  push("UPDATE-ERR===" + (e.message || e));
}
push("ROWS-AFFECTED===" + affected);

// 4) Read after
let after = [];
try {
  const a = db.execute({
    sql: "SELECT id, name, purchase_price, selling_price, stock_quantity FROM products WHERE LOWER(name) LIKE '%iphone%'",
  });
  after = a.rows;
} catch (e) {
  push("AFTER-ERR===" + (e.message || e));
}
push("AFTER===" + JSON.stringify(after));

// 5) New inventory total (the card's real feed)
let inv = null;
try {
  const it = db.execute({
    sql: "SELECT COALESCE(SUM(purchase_price * stock_quantity),0) AS total FROM products WHERE stock_quantity > 0",
  });
  inv = it.rows?.length ? it.rows[0] : null;
} catch (e) {
  push("INV-ERR===" + (e.message || e));
}
push("INV-TOTAL===" + JSON.stringify(inv));

writeFileSync(REPORT, lines.join("\n"), "utf8");
console.log("REPORT-SIZE===" + statSync(REPORT).size);
