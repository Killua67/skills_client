#!/usr/bin/env node

function usage() {
  console.error("Usage: recheck.mjs <stock_code>\n  stock_code: 6-digit stock code, e.g. 600519");
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) usage();

const code = (args[0] || "").trim();
if (!code) usage();

const apiKey = (process.env.AGU_API_KEY ?? "").trim();
if (!apiKey) {
  console.error("Missing AGU_API_KEY");
  process.exit(1);
}

const baseUrl = (process.env.AGU_API_BASE_URL || "https://service.dazhidayong.cn").replace(/\/$/, "");
const query = new URLSearchParams({ code });

const resp = await fetch(`${baseUrl}/api/stock/recheck?${query.toString()}`, {
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
const meta = d.stock_meta || {};
const assess = d.current_assessment || {};
const quote = d.quote || {};

console.log(`## 单股复盘 (${d.code} ${d.name})\n`);
console.log(`- 当前模型得分: ${d.score} / 阈值 ${d.threshold} (${d.passes_threshold ? "达到" : "未达到"})`);
console.log(`- 近30天入池: ${d.selected_in_last_month ? "是" : "否"}`);
if (d.selection_state?.last_selected_date) {
  console.log(`- 最近一次入池: ${d.selection_state.last_selected_date}`);
}
if (quote.price !== null && quote.price !== undefined) {
  console.log(`- 最新价: ${quote.price}${quote.pct_chg !== null && quote.pct_chg !== undefined ? ` (${quote.pct_chg >= 0 ? "+" : ""}${quote.pct_chg}%)` : ""}`);
}

console.log(`\n## 总结`);
for (const line of assess.summary_lines || []) {
  console.log(`- ${line}`);
}

console.log(`\n## 板块与财务`);
console.log(`- 板块: ${meta.board_name || d.board_name || "-"}`);
console.log(`- 行业: ${meta.industry_text || d.industry || "-"}`);
console.log(`- 质量标签: ${meta.quality_text || (meta.is_head ? "龙头/优质公司" : "-")}`);
console.log(`- TTM市盈率: ${meta.pe_ttm ?? "-"}`);
console.log(`- 动态市盈率: ${meta.pe_dong ?? "-"}`);
console.log(`- 估算总市值(亿): ${meta.derived_market_value ?? "-"}`);

if (assess.strategies?.length) {
  console.log(`\n## 当前主要信号`);
  for (const item of assess.strategies) {
    console.log(`- ${item}`);
  }
}
