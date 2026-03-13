---
name: a-gu-stock-query
description: 查询A股大盘分析、市场指标、股票推荐和单股复盘数据。当用户询问大盘行情、今日市场分析、市场广度/宏观指标、股票推荐、选股结果、个股是否近期进过选股池时使用。
metadata: {"requires":{"bins":["node"],"env":["AGU_API_KEY"]},"primaryEnv":"AGU_API_KEY"}
---

# A股选股查询

查询 A_gu 选股系统的大盘分析、市场指标、股票推荐和单股复盘数据。

## 大盘分析

```bash
node {baseDir}/scripts/market.mjs "today"
node {baseDir}/scripts/market.mjs "yesterday"
node {baseDir}/scripts/market.mjs "2026-03-12"
```

## 股票推荐

```bash
node {baseDir}/scripts/recommend.mjs "today"
node {baseDir}/scripts/recommend.mjs "today" -n 10
node {baseDir}/scripts/recommend.mjs "yesterday" -n 20
```

## 市场指标

```bash
node {baseDir}/scripts/metrics.mjs "today"
node {baseDir}/scripts/metrics.mjs "today" --keys "breadth.*,limit.*"
node {baseDir}/scripts/metrics.mjs "2026-03-12" --ap 3 --keys "macro.us10y_yield,macro.fear_greed"
```

## 单股复盘

```bash
node {baseDir}/scripts/recheck.mjs "600519"
node {baseDir}/scripts/recheck.mjs "000858"
```

## 参数

- 第一个参数: 日期 - `today`/`yesterday`/`YYYY-MM-DD`，默认 `today`
- `-n <count>`: 推荐数量（仅 recommend），默认 5，最多 30
- `--ap <1|2|3>`: 查询指定时段（仅 metrics），默认取当日最新批次
- `--keys "<pattern1,pattern2>"`: 按指标键过滤（仅 metrics），支持精确匹配和前缀通配，如 `breadth.*`
- 单股复盘命令第一个参数为股票代码，如 `600519`

## 返回数据

**大盘分析**: 三大指数、板块涨跌榜、高分板块、宏观/广度指标、选股总数

**股票推荐**: 股票代码/名称、评分(40+模型)、命中策略、所属行业

**市场指标**: 涨跌家数、涨跌停家数、美债10Y、恐贪指数等第三方指标明细

**单股复盘**: 近 30 天是否进过选股池、当前模型重跑得分、所属板块、部分财务/质量信息、简要总结

Notes:
- 需要 `AGU_API_KEY` 环境变量
- 可选 `AGU_API_BASE_URL`，默认 `https://service.dazhidayong.cn`
- 数据来源于每日定时选股程序，非交易日无数据
- **投资有风险，数据仅供参考**
