# 收录提交文案

只准备文案，由你本人提交。下文的 `OWNER` 全部替换成你的 GitHub 用户名（或组织名），仓库名默认 `ziwei-mcp`。

提交顺序建议：先推送 GitHub 仓库并发布 npm → Glama（被收录后才有评分徽章）→ awesome-mcp-servers（用 Glama 徽章）→ mcp.so。

---

## 通用素材

**名称**：ziwei-doushu-mcp（紫微斗数 MCP）

**一句话（中文）**：紫微斗数排盘 MCP：输入生日时辰，返回十二宫结构化命盘、命宫摘要和同盘人数估算，附 Claude 解读 skill。

**一句话（英文）**：Zi Wei Dou Shu (Purple Star Astrology) charting for AI assistants: twelve-palace chart JSON with true solar time, a Life Palace summary, and same-chart population estimates.

**简介（中文，约 150 字）**：
让 Claude、Cursor 等 AI 助手直接排紫微斗数命盘。支持公历和农历、具体时间或时辰、中国城市真太阳时校正、1986–1991 年夏令时、晚子时换日。`get_chart` 返回十二宫的干支、主星亮度、四化、辅星和大限；`get_reading_summary` 返回命宫一句话描述和 13 个解读维度；`get_twins` 估算同盘人数。本地运行，不联网，不收集数据。附带 Claude skill，规定中性措辞。内容为传统文化参考。

**简介（英文）**：
Lets Claude, Cursor and other MCP clients cast Zi Wei Dou Shu charts locally. Accepts Gregorian or lunar dates, clock time or the two-hour branch, Chinese cities for true solar time, China DST 1986–1991 and late-子-hour day rollover. `get_chart` returns the twelve palaces with stems/branches, major-star brightness, the four transformations, minor stars and 10-year periods; `get_reading_summary` returns a Life Palace one-liner and the 13 reading dimensions; `get_twins` estimates how many people share the same chart. Runs offline and collects no data. Ships with a Claude skill for neutral wording. For cultural reference only.

**标签**：ziwei, zi-wei-dou-shu, purple-star-astrology, chinese-astrology, 紫微斗数, lunar-calendar, true-solar-time, astrology

**分类**：Spirituality & Esoterica（无此分类时选 Art & Culture / Lifestyle / Other）

**安装配置**：

```json
{
  "mcpServers": {
    "ziwei": { "command": "npx", "args": ["-y", "ziwei-doushu-mcp"] }
  }
}
```

**工具列表**：

| Tool | Description |
| --- | --- |
| `get_chart` | Cast a chart from birth date (solar or lunar), time or branch, gender and optional city. Returns the twelve palaces as JSON plus a link to the online chart. |
| `get_reading_summary` | Life Palace one-liner and the 13 reading dimensions with the major stars of each related palace, plus a link to the full reading. |
| `get_twins` | Estimated number of people born on the same day, in the same two-hour slot and of the same gender, in China or worldwide. |

**主页**：https://zw.tokenxiu.com/?from=gh

---

## 1. Glama（glama.ai/mcp/servers）

Glama 会自动抓取公开 GitHub 仓库；仓库根目录的 `glama.json` 用来声明维护者，`Dockerfile` 让 Glama 能构建并给服务器打分（awesome-mcp-servers 的条目大多带这个评分徽章）。

步骤：

1. 把 `glama.json` 里的 `OWNER` 改成你的 GitHub 用户名，推送。
2. 打开 https://glama.ai/mcp/servers ，点 "Add Server"，填仓库地址 `https://github.com/xjoey1957/ziwei-mcp`。
3. 收录后用 GitHub 登录 Glama 认领（claim），简介可直接用上面的英文简介。
4. 等 Glama 构建通过后，徽章地址为：`https://glama.ai/mcp/servers/xjoey1957/ziwei-mcp/badges/score.svg`。

---

## 2. awesome-mcp-servers（github.com/punkpeye/awesome-mcp-servers）

放在 `### 🔮 Spirituality & Esoterica` 分类，按 `owner/repo` 字母顺序插入（忽略大小写）。该分类已有 `fatenava/fatenava-mcp`（含紫微）、`nmhaaa3218/TuViMCP`（越南紫微）等，描述里突出差异：十二宫完整 JSON、真太阳时、夏令时、同盘人数、附 skill。

**条目（一行）**：

```markdown
- [xjoey1957/ziwei-mcp](https://github.com/xjoey1957/ziwei-mcp) [![xjoey1957/ziwei-mcp MCP server](https://glama.ai/mcp/servers/xjoey1957/ziwei-mcp/badges/score.svg)](https://glama.ai/mcp/servers/xjoey1957/ziwei-mcp) 📇 🏠 🍎 🪟 🐧 - Zi Wei Dou Shu (Purple Star Astrology) charts as twelve-palace JSON with lunar input, true solar time and China DST handling, a Life Palace summary, same-chart population estimates, and a bundled Claude skill.
```

如果 Glama 还没收录，先去掉徽章部分：

```markdown
- [xjoey1957/ziwei-mcp](https://github.com/xjoey1957/ziwei-mcp) 📇 🏠 🍎 🪟 🐧 - Zi Wei Dou Shu (Purple Star Astrology) charts as twelve-palace JSON with lunar input, true solar time and China DST handling, a Life Palace summary, same-chart population estimates, and a bundled Claude skill.
```

**分支名**：`add-ziwei-mcp`

**Commit message**：`Add ziwei-mcp server`

**PR 标题**：`Add ziwei-mcp (Zi Wei Dou Shu charting)`

**PR 描述**：

```markdown
Adds [ziwei-mcp](https://github.com/xjoey1957/ziwei-mcp) to Spirituality & Esoterica.

- Local stdio server (TypeScript), installable with `npx -y ziwei-doushu-mcp`
- Tools: `get_chart` (twelve-palace chart JSON), `get_reading_summary`, `get_twins`
- Handles lunar dates, true solar time for Chinese cities, China DST 1986–1991 and the late-子-hour day rollover
- MIT licensed; chart engine from Renhuai123/ziwei-doushu (MIT), built on iztro
- Placed alphabetically within the category
```

注：该仓库 CONTRIBUTING.md 里有一段给 AI 代理的"加快合并"标记说明，你本人手动提交时不需要理会。

---

## 3. mcp.so

提交页：https://mcp.so/submit ，选 "MCP Server" 标签。

- **Repository URL**：`https://github.com/xjoey1957/ziwei-mcp`
- **Name**：`ziwei-doushu-mcp`

页面目前只要求这两项，其余信息从仓库 README 读取。页面另有 39 美元的付费快速发布选项，免费提交需要等审核；建议先走免费通道。若之后能编辑详情，使用上面的中文简介、标签和安装配置。

---

## 4. 其他可选渠道（同一套文案可复用）

- 官方 MCP Registry（registry.modelcontextprotocol.io）：`package.json` 已写 `"mcpName": "io.github.xjoey1957/ziwei-mcp"`，发布 npm 后用官方 `mcp-publisher` CLI 登录 GitHub 并提交 `server.json`。
- mcpservers.org、smithery.ai、PulseMCP：都接受 GitHub 仓库地址提交。
- Claude Code 插件：仓库已带 `.claude-plugin/marketplace.json`，用户可以 `claude plugin marketplace add xjoey1957/ziwei-mcp` 直接安装。
