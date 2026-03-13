#!/usr/bin/env node

function usage() {
  console.error(`Usage: market.mjs [date]\n  date: today | yesterday | YYYY-MM-DD (default: today)`);
  process.exit(2);
}

const args = process.argv.slice(2);
if (args[0] === "-h" || args[0] === "--help") usage();

const date = args[0] || "today";

const apiKey = (process.env.AGU_API_KEY ?? "").trim();
if (!apiKey) {
  console.error("Missing AGU_API_KEY");
  process.exit(1);
}

const baseUrl = (process.env.AGU_API_BASE_URL || "https://service.dazhidayong.cn").replace(/\/$/, "");

const resp = await fetch(`${baseUrl}/api/market/analysis?date=${encodeURIComponent(date)}`, {
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
console.log(`## 大盘分析 (${d.date} ${d.time_period})\n`);

// 指数
const indices = d.indices || {};
for (const [name, info] of Object.entries(indices)) {
  if (info && info.price) {
    const chg = info.pct_chg >= 0 ? `+${info.pct_chg}%` : `${info.pct_chg}%`;
    console.log(`- **${name}**: ${info.price} (${chg}) 评分:${info.strong || 0}`);
  }
}

// 板块涨跌榜
const summary = d.board_summary || {};
if (summary["行业"]?.top) {
  console.log(`\n## 行业板块 TOP5`);
  for (const [name, pct] of Object.entries(summary["行业"].top)) {
    console.log(`- ${name}: ${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`);
  }
}

const topBoards = d.top_boards || [];
if (topBoards.length) {
  console.log(`\n## 高分板块 TOP10`);
  for (const board of topBoards) {
    const pct = board.pct_chg === null || board.pct_chg === undefined
      ? "-"
      : `${board.pct_chg >= 0 ? "+" : ""}${board.pct_chg.toFixed(2)}%`;
    console.log(`- ${board.name} (${board.code}): ${pct} 评分:${board.score ?? 0}`);
  }
}

const macroMetrics = d.macro_metrics || {};
const metricEntries = Object.entries(macroMetrics);
if (metricEntries.length) {
  console.log(`\n## 宏观/广度指标`);
  for (const [key, item] of metricEntries) {
    const label = item.metric_name_cn || key;
    const value =
      item.value_num !== null && item.value_num !== undefined
        ? `${item.value_num}${item.unit ? " " + item.unit : ""}`
        : item.value_str || "-";
    const extra =
      item.value_str && item.value_num !== null && item.value_num !== undefined
        ? ` | 状态:${item.value_str}`
        : "";
    console.log(`- ${label}: ${value}${extra}`);
  }
}

console.log(`\n当日选出股票: ${d.total_selected || 0} 只`);
