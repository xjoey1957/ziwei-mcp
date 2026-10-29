import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getChart, getReadingSummary, getTwins } from './tools';

export const VERSION = '0.1.0';

const birthShape = {
  date: z.string().describe('出生日期 YYYY-MM-DD。calendar=lunar 时填农历年月日，如 1990-04-21'),
  calendar: z.enum(['solar', 'lunar']).optional().describe("'solar' 公历（默认）或 'lunar' 农历"),
  leapMonth: z.boolean().optional().describe('农历闰月时为 true'),
  time: z.string().optional().describe('出生钟表时间 HH:MM（24 小时制）。已知具体时间时优先填这个'),
  branch: z.union([z.number().int().min(0).max(11), z.string()]).optional()
    .describe('只知道时辰时填：0–11 或 子/丑/寅/卯/辰/巳/午/未/申/酉/戌/亥'),
  lateZi: z.boolean().optional().describe('子时出生且为晚子时（23:00–23:59）时为 true，按次日排盘'),
  gender: z.enum(['male', 'female']).describe("'male' 男 或 'female' 女"),
  city: z.string().optional().describe('出生城市（中国），如「北京」「广东省/深圳」。填了且有具体时间时做真太阳时校正'),
  ignoreDst: z.boolean().optional().describe('1986–1991 夏令时期间，所填已是标准时间时为 true；默认自动减 1 小时'),
};

type Handler<T> = (args: T) => unknown;
function wrap<T>(fn: Handler<T>) {
  return async (args: T) => {
    try {
      const result = fn(args);
      return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }], structuredContent: result as Record<string, unknown> };
    } catch (error) {
      return { content: [{ type: 'text' as const, text: `输入有误：${error instanceof Error ? error.message : String(error)}` }], isError: true };
    }
  };
}

const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

export function createServer(): McpServer {
  const server = new McpServer({ name: 'ziwei-doushu-mcp', version: VERSION });
  server.registerTool('get_chart', {
    title: '紫微斗数排盘',
    description: '根据出生日期（公历或农历）、时间或时辰、性别、可选出生城市，排出紫微斗数命盘，返回十二宫结构化 JSON（宫位、干支、主星亮度、四化、辅星、大限）以及在线命盘链接。内容为传统文化参考。',
    inputSchema: birthShape,
    annotations: { title: '紫微斗数排盘', ...readOnly },
  }, wrap(getChart));
  server.registerTool('get_reading_summary', {
    title: '命盘解读摘要',
    description: '返回命宫主星的一句话中性描述、13 个解读维度（命格总览、性格、感情、事业、财运、作息与压力等）的标题及各自对应宫位的主星，并附网站上完整 13 维解读的链接。内容为传统文化参考。',
    inputSchema: birthShape,
    annotations: { title: '命盘解读摘要', ...readOnly },
  }, wrap(getReadingSummary));
  server.registerTool('get_twins', {
    title: '同盘人数估算',
    description: '估算与此人命盘结构完全相同（同一天、同一时辰、同性别出生）的人数，基于公开出生人口统计，并附在线页面链接。',
    inputSchema: { ...birthShape, region: z.enum(['china', 'world']).optional().describe("统计范围：'china' 中国（默认）或 'world' 全球") },
    annotations: { title: '同盘人数估算', ...readOnly },
  }, wrap(getTwins));
  return server;
}
