#!/usr/bin/env node

function usage() {
  console.error(
    "Usage: metrics.mjs [date] [--ap 1|2|3] [--keys pattern1,pattern2]\n" +
      "  date: today | yesterday | YYYY-MM-DD (default: today)\n" +
      "  --ap: time period (optional)\n" +
      "  --keys: metric keys or wildcard prefixes (optional)"
  );
  process.exit(2);
}

const args = process.argv.slice(2);
if (args.includes("-h") || args.includes("--help")) usage();

let date = "today";
let ap = "";
let keys = "";

for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--ap") {
    ap = args[i + 1] ?? "";
    i++;
  } else if (a === "--keys") {
    keys = args[i + 1] ?? "";
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
const query = new URLSearchParams({ date });
if (ap) query.set("select_ap", ap);
if (keys) query.set("keys", keys);

const resp = await fetch(`${baseUrl}/api/market/metrics?${query.toString()}`, {
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
const apNames = {
  1: "盘中早(11:30)",
  2: "盘中晚(14:30)",
  3: "收盘后(15:00)"
};

console.log(`## 市场指标 (${d.date} ${apNames[d.select_ap] || d.select_ap})\n`);

if (!d.items?.length) {
  console.log("无指标数据");
  process.exit(0);
}

for (const item of d.items) {
  const value =
    item.value_num !== null && item.value_num !== undefined
      ? `${item.value_num}${item.unit ? " " + item.unit : ""}`
      : item.value_str || "-";
  const extra =
    item.value_str && item.value_num !== null && item.value_num !== undefined
      ? ` | 状态:${item.value_str}`
      : "";
  console.log(`- ${item.metric_name_cn || item.metric_key}: ${value}${extra}`);
}
