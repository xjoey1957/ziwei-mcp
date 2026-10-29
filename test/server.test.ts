import { describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../src/server';

async function connect() {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test', version: '0.0.0' });
  await Promise.all([createServer().connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

describe('MCP server', () => {
  it('lists the three tools', async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    expect(tools.map(t => t.name).sort()).toEqual(['get_chart', 'get_reading_summary', 'get_twins']);
    expect(tools.every(t => t.annotations?.readOnlyHint)).toBe(true);
  });

  it('calls each tool over the protocol', async () => {
    const client = await connect();
    const args = { date: '1990-05-15', time: '08:30', gender: 'male' };
    for (const name of ['get_chart', 'get_reading_summary', 'get_twins']) {
      const result = await client.callTool({ name, arguments: args });
      expect(result.isError).toBeFalsy();
      const body = JSON.parse((result.content as { type: string; text: string }[])[0].text);
      expect(body.url ?? body.fullReading.url).toContain('from=mcp');
    }
  });

  it('returns isError for invalid input', async () => {
    const client = await connect();
    const result = await client.callTool({ name: 'get_chart', arguments: { date: '1990-13-01', time: '08:30', gender: 'male' } });
    expect(result.isError).toBe(true);
  });
});
