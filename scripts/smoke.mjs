// Starts the built server over stdio (as Claude Code / Cursor would) and calls each tool once.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({ command: process.execPath, args: ['dist/index.js'] });
const client = new Client({ name: 'smoke', version: '0.0.0' });
await client.connect(transport);

const { tools } = await client.listTools();
console.log('tools:', tools.map(t => t.name).join(', '));

const args = { date: '1990-05-15', time: '08:30', gender: 'male', city: '北京' };
for (const name of ['get_chart', 'get_reading_summary', 'get_twins']) {
  const result = await client.callTool({ name, arguments: args });
  const body = JSON.parse(result.content[0].text);
  if (result.isError) throw new Error(`${name} failed: ${result.content[0].text}`);
  if (name === 'get_chart') console.log(name, '→', body.lunar, body.wuxingJu, '命宫', body.palaces[0].branch, body.palaces[0].majorStars.map(s => s.name).join('、'), body.url);
  if (name === 'get_reading_summary') console.log(name, '→', body.oneLiner, `(${body.dimensions.length} 维)`, body.fullReading.url);
  if (name === 'get_twins') console.log(name, '→', body.estimatedSameChart, body.url);
}
await client.close();
