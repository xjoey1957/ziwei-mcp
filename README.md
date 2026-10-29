# 紫微斗数 MCP · ziwei-doushu-mcp

> **在线体验 / Try it online：[zw.tokenxiu.com](https://zw.tokenxiu.com/?from=gh)**：免费排盘、13 维解读、合盘、同盘人数。

让 Claude、Cursor 等 AI 助手直接排紫微斗数命盘：输入生日、时间（或时辰）、性别，返回十二宫结构化 JSON，再配一个 Claude skill，用中性、具体的语言解读。

A Model Context Protocol server that lets Claude, Cursor and other AI assistants cast Zi Wei Dou Shu (紫微斗数) charts. It returns the twelve palaces as structured JSON and ships with a Claude skill that explains charts in neutral, plain language.

*内容为传统文化参考，不构成任何预测，也不构成医疗、法律、投资建议。For cultural reference only.*

[中文](#中文) · [English](#english)

---

## 中文

### 工具

| 工具 | 作用 |
| --- | --- |
| `get_chart` | 排盘：十二宫（宫名、干支、主星亮度、四化、辅星煞星杂曜、空宫借星）、五行局、命主身主、四柱、大限 |
| `get_reading_summary` | 命宫主星一句话描述 + 13 个解读维度标题及各自对应宫位的主星 |
| `get_twins` | 估算同一天、同一时辰、同性别出生（命盘结构相同）的人数，可选中国或全球 |

每个结果都带一个网站链接，可以查看完整命盘图和 13 维解读。

输入参数（三个工具相同）：

| 参数 | 说明 |
| --- | --- |
| `date` | `YYYY-MM-DD`，公历；农历时为农历年月日 |
| `calendar` | `solar`（默认）或 `lunar` |
| `leapMonth` | 农历闰月传 `true` |
| `time` | 出生钟表时间 `HH:MM` |
| `branch` | 不知道具体时间时填时辰：`子`…`亥` 或 0–11 |
| `lateZi` | 晚子时（23:00–23:59）传 `true`，按次日排盘 |
| `gender` | `male` / `female` |
| `city` | 可选，中国城市，如 `北京`、`广东省/深圳`；有具体时间时做真太阳时校正 |
| `ignoreDst` | 1986–1991 年夏令时期间默认把钟表时间减 1 小时；所填已是标准时间时传 `true` |
| `region` | 仅 `get_twins`：`china`（默认）或 `world` |

排盘口径与网站一致：晚子时换日、1986–1991 年中国夏令时、真太阳时（经度 + 均时差）、XD2 亮度表、闰月按月中分界。

### 安装

需要 Node.js 18 或更高版本。

**Claude Code**

```bash
claude mcp add ziwei -- npx -y ziwei-doushu-mcp
```

或者作为插件安装，同时装上 MCP 和解读 skill：

```bash
claude plugin marketplace add xjoey1957/ziwei-mcp
```

```bash
claude plugin install ziwei@ziwei-mcp
```

**Claude Desktop**：编辑 `claude_desktop_config.json`（设置 → 开发者 → 编辑配置）：

```json
{
  "mcpServers": {
    "ziwei": { "command": "npx", "args": ["-y", "ziwei-doushu-mcp"] }
  }
}
```

**Cursor**：编辑 `~/.cursor/mcp.json`（全局）或项目内 `.cursor/mcp.json`，内容同上。

**VS Code (Copilot)**：项目内 `.vscode/mcp.json`：

```json
{
  "servers": {
    "ziwei": { "type": "stdio", "command": "npx", "args": ["-y", "ziwei-doushu-mcp"] }
  }
}
```

**Cherry Studio、Cline、Windsurf 等**：添加 stdio 类型的 MCP 服务器，命令 `npx`，参数 `-y ziwei-doushu-mcp`。

Windows 上如果客户端提示找不到 `npx`，把命令改为 `cmd`，参数改为 `/c npx -y ziwei-doushu-mcp`。

### Claude skill

[`skills/ziwei/SKILL.md`](skills/ziwei/SKILL.md) 告诉 Claude 何时调用哪个工具、缺信息时怎么追问、怎样用中性措辞解读，以及结尾附链接和"传统文化参考"说明。

- 用上面的插件方式安装会自动带上 skill。
- 手动安装：把 `skills/ziwei` 目录复制到 `~/.claude/skills/ziwei`（个人）或项目的 `.claude/skills/ziwei`。
- Claude.ai / Claude Desktop：把 `skills/ziwei` 打包成 zip，在 Claude 的 Skills 设置里上传。

### 示例

> 我 1990 年 5 月 15 日早上 8 点半在北京出生，男，帮我看看紫微命盘。

`get_reading_summary` 返回（节选）：

```json
{
  "input": {
    "solarDate": "1990-05-15", "branch": "辰时", "gender": "男", "city": "北京市/北京", "trueSolarTime": "07:19",
    "notes": ["该日期处于 1990 年中国夏令时期间，已把钟表时间减 1 小时（标准时间 07:30）。"]
  },
  "mingGong": { "branch": "丑", "majorStars": ["天机（陷）"] },
  "wuxingJu": "火六局",
  "oneLiner": "命宫主星为天机（陷），传统上常用「爱思考、善谋划、懂变通」来描述这类命宫的性格底色。",
  "dimensions": [
    { "key": "overview", "title": "命格总览", "palace": "命宫", "majorStars": ["天机（陷）"] },
    { "key": "career", "title": "事业", "palace": "官禄宫", "majorStars": ["巨门（庙）"] }
  ],
  "fullReading": { "url": "https://zw.tokenxiu.com/chart?date=1990-05-15&mode=clock&time=08%3A30&gender=male&city=...&from=mcp" }
}
```

### 开发

```bash
npm install
```

```bash
npm test
```

```bash
npm run smoke
```

`npm test` 覆盖三个工具的输入输出、农历/时辰/真太阳时/夏令时/晚子时、错误输入、文案红线词检查，以及通过 MCP 协议的调用。`npm run smoke` 构建后以 stdio 方式启动服务并实际调用三个工具。`npm run inspector` 打开 MCP Inspector 手动调试。

### 来源与许可

- 本仓库代码：MIT，见 [LICENSE](LICENSE)。
- 排盘引擎 `src/engine/`：来自 [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu) 的 `lib/ziwei/`，MIT，版权归原作者，许可证见 [src/engine/LICENSE](src/engine/LICENSE)，改动说明见 [src/engine/NOTICE.md](src/engine/NOTICE.md)。本仓库只收录排盘所需文件，不含原仓库的断语、案例和引述类内容。
- 底层排盘库：[iztro](https://github.com/SylarLong/iztro)（MIT）；历法：[lunar-javascript](https://github.com/6tail/lunar-javascript)（MIT）。
- 网站上的 13 维解读使用了"紫微斗数开源解读数据集 v4.0"（CC BY 4.0），来源 [github.com/Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu)，作者：王多鱼AI；网站删除了其中的部分引述并调整了表述。本 MCP 不分发该数据集，`get_reading_summary` 的一句话描述为本仓库自写。
- 同盘人数按公开的年度出生人口统计估算，只表示量级。

---

## English

### Tools

| Tool | What it returns |
| --- | --- |
| `get_chart` | The twelve palaces (name, stem/branch, major stars with brightness, the four transformations 四化, minor stars, borrowed stars for empty palaces), Five-Element Bureau, Life/Body Master, Four Pillars and the 10-year periods (大限) |
| `get_reading_summary` | A one-line neutral description of the Life Palace (命宫) and the 13 reading dimensions with the major stars of each related palace |
| `get_twins` | Estimated number of people born on the same day, in the same two-hour slot and of the same gender (i.e. sharing the same chart), in China or worldwide |

Every result includes a link to the full chart and the 13-dimension reading on [zw.tokenxiu.com](https://zw.tokenxiu.com/?from=gh).

Inputs (shared by all three tools): `date` (`YYYY-MM-DD`, Gregorian, or lunar when `calendar` is `lunar`), `calendar`, `leapMonth`, `time` (`HH:MM`) or `branch` (`子`…`亥` or 0–11), `lateZi`, `gender` (`male`/`female`), optional `city` (Chinese cities, used for true solar time), `ignoreDst`, and `region` for `get_twins`.

Chart rules match the website: late-子 hour rolls to the next day, China DST 1986–1991, true solar time (longitude plus equation of time), XD2 brightness table.

### Install

Requires Node.js 18+.

Claude Code:

```bash
claude mcp add ziwei -- npx -y ziwei-doushu-mcp
```

As a Claude Code plugin (MCP server plus the reading skill):

```bash
claude plugin marketplace add xjoey1957/ziwei-mcp
```

```bash
claude plugin install ziwei@ziwei-mcp
```

Claude Desktop, Cursor (`~/.cursor/mcp.json`) and most other clients:

```json
{
  "mcpServers": {
    "ziwei": { "command": "npx", "args": ["-y", "ziwei-doushu-mcp"] }
  }
}
```

VS Code uses `.vscode/mcp.json` with a top-level `"servers"` key and `"type": "stdio"`. On Windows, if the client cannot find `npx`, use `"command": "cmd"` and `"args": ["/c", "npx", "-y", "ziwei-doushu-mcp"]`.

### Claude skill

[`skills/ziwei/SKILL.md`](skills/ziwei/SKILL.md) tells Claude when to call each tool, what to ask when birth data is missing, and how to explain a chart in neutral terms without fear-based wording or medical advice. Copy `skills/ziwei` to `~/.claude/skills/ziwei`, or install the plugin above.

### Attribution and license

- This repository: MIT.
- Chart engine in `src/engine/`: from `lib/ziwei/` of [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu), MIT, original license kept in [src/engine/LICENSE](src/engine/LICENSE). Only the chart-calculation files are included.
- Built on [iztro](https://github.com/SylarLong/iztro) and [lunar-javascript](https://github.com/6tail/lunar-javascript) (both MIT).
- The website's 13-dimension readings use the Zi Wei Dou Shu Open Reading Dataset v4.0 (CC BY 4.0) by 王多鱼AI, [github.com/Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu). This package does not redistribute the dataset.

For cultural reference only. Nothing here is a prediction or medical, legal or financial advice.
