# skills_client

这个目录用于存放面向大模型调用的技能请求端实现。

每个技能通常包含以下内容：

- `SKILL.md`：技能说明、触发场景、命令示例、参数说明
- `scripts/`：实际发起请求的脚本，通常对接项目内 API
- `_meta.json`：技能元数据

## 当前技能

### `a-gu-stock-query`

用于查询 A 股选股系统相关数据，当前支持：

- 大盘分析
- 市场指标查询
- 股票推荐

对应目录：

- [a-gu-stock-query](/Users/wangzhiyong/AI_Projects/A_gu/skills_client/a-gu-stock-query)

主要文件：

- [SKILL.md](/Users/wangzhiyong/AI_Projects/A_gu/skills_client/a-gu-stock-query/SKILL.md)
- [market.mjs](/Users/wangzhiyong/AI_Projects/A_gu/skills_client/a-gu-stock-query/scripts/market.mjs)
- [metrics.mjs](/Users/wangzhiyong/AI_Projects/A_gu/skills_client/a-gu-stock-query/scripts/metrics.mjs)
- [recommend.mjs](/Users/wangzhiyong/AI_Projects/A_gu/skills_client/a-gu-stock-query/scripts/recommend.mjs)

## 目录约定

- 一个子目录对应一个独立技能
- 技能脚本优先复用项目已有接口，不直接重复业务逻辑
- `SKILL.md` 中的能力描述应与实际脚本能力保持一致
- 如果后端接口新增能力，应同步检查技能说明和脚本是否需要更新

## 维护建议

- 新增技能时，先定义清楚调用场景，再补 `SKILL.md`
- 变更接口字段后，优先检查 `scripts/` 输出是否仍然匹配
- 如果某个能力不希望暴露给大模型汇总入口，不要写入 `SKILL.md`
