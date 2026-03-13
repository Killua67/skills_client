#!/usr/bin/env node

function usage() {
  console.error(`Usage: recommend.mjs [date] [-n count]\n  date: today | yesterday | YYYY-MM-DD (default: today)\n  -n: number of results (default: 5, max: 30)`);
  process.exit(2);
}

const args = process.argv.slice(2);
if (args[0] === "-h" || args[0] === "--help") usage();

let date = "today";
let n = 5;

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "-n") {
    n = Math.min(30, Math.max(1, Number.parseInt(args[i + 1] ?? "5", 10)));
    i++;
  } else if (!a.startsWith("-")) {
    date = a;
  }
}

const apiKey = (process.env.AGU_API_KEY ?? "").trim();
if (!apiKey) {
  console.error("Missing AGU_API_KEY");
  process.exit(1);
}

const baseUrl = (process.env.AGU_API_BASE_URL || "http://localhost:5088").replace(/\/$/, "");

const resp = await fetch(`${baseUrl}/api/stock/recommend?date=${encodeURIComponent(date)}&limit=${n}`, {
  headers: { "X-API-Key": apiKey }
});

if (!resp.ok) {
  const text = await resp.text().catch(() => "");
  throw new Error(`API failed (${resp.status}): ${text}`);
}

const data = await resp.json();

if (!data.success) {
  console.error(data.error || "Unknown error");
  process.exit(1);
}

const d = data.data;
console.log(`## 股票推荐 (${d.date})\n`);
console.log(`共选出 ${d.total_count} 只，展示 TOP ${d.returned_count}:\n`);

for (const s of d.stocks || []) {
  const chg = s.price ? ` 价格:${s.price}` : "";
  console.log(`- **[${s.score}分] ${s.code} ${s.name}**${chg}`);
  console.log(`  行业: ${s.industry || "-"} | 板块: ${s.board || "-"}`);
  if (s.strategies) {
    console.log(`  策略: ${s.strategies.slice(0, 100)}${s.strategies.length > 100 ? "..." : ""}`);
  }
  console.log();
}
