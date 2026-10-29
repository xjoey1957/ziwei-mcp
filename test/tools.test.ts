import { describe, expect, it } from 'vitest';
import { getChart, getReadingSummary, getTwins, DIMENSIONS } from '../src/tools';
import { estimateTwins } from '../src/twins';

const base = { date: '1990-05-15', time: '08:30', gender: 'male' as const };
const RED_LINE = /算命|改运|化解|大凶|血光|死别|夭折|倪/u;

describe('get_chart', () => {
  it('returns twelve palaces starting from 命宫', () => {
    const chart = getChart(base);
    expect(chart.palaces).toHaveLength(12);
    expect(chart.palaces.map(p => p.name)).toEqual(['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '仆役', '官禄', '田宅', '福德', '父母']);
    expect(chart.mingGong).toBe('丑');
    expect(chart.palaces[0].majorStars).toEqual([{ name: '天机', brightness: '陷' }]);
    expect(chart.wuxingJu).toBe('火六局');
    expect(chart.lunar).toBe('庚午年4月21日');
    expect(chart.input.branch).toBe('辰时');
    expect(chart.palaces.flatMap(p => p.majorStars).filter(s => 'siHua' in s)).toHaveLength(4);
    expect(chart.url).toBe('https://zw.tokenxiu.com/chart?date=1990-05-15&mode=clock&time=08%3A30&gender=male&from=mcp');
    expect(chart.disclaimer).toContain('传统文化参考');
  });

  it('gives the same chart for the equivalent lunar date and branch', () => {
    const lunar = getChart({ date: '1990-04-21', calendar: 'lunar', branch: '辰', gender: 'male' });
    expect(lunar.palaces).toEqual(getChart(base).palaces);
    expect(lunar.input.solarDate).toBe('1990-05-15');
    expect(lunar.url).toContain('cal=lunar&ly=1990&lm=4&ld=21');
    expect(lunar.url).toContain('mode=branch&branch=4');
  });

  it('applies true solar time for a city', () => {
    const chart = getChart({ date: '1990-05-15', time: '07:05', gender: 'female', city: '乌鲁木齐' });
    expect(chart.input.city).toBe('新疆维吾尔自治区/乌鲁木齐');
    expect(chart.input.branch).toBe('寅时');
    expect(chart.url).toContain(`city=${encodeURIComponent('新疆维吾尔自治区/乌鲁木齐')}`);
  });

  it('moves late 子时 to the next day', () => {
    const chart = getChart({ date: '1999-12-31', branch: 0, lateZi: true, gender: 'male' });
    expect(chart.input.chartDate).toBe('2000-01-01');
    expect(chart.url).toContain('zi=late');
  });

  it('subtracts an hour during China DST unless told not to', () => {
    expect(getChart({ date: '1988-06-01', time: '09:30', gender: 'male' }).input.branch).toBe('辰时');
    const std = getChart({ date: '1988-06-01', time: '09:30', gender: 'male', ignoreDst: true });
    expect(std.input.branch).toBe('巳时');
    expect(std.url).toContain('dst=std');
  });

  it('rejects bad input with readable errors', () => {
    expect(() => getChart({ ...base, date: '1990-02-30' })).toThrow(/真实存在/);
    expect(() => getChart({ date: '1990-05-15', gender: 'male' })).toThrow(/time/);
    expect(() => getChart({ ...base, city: '朝阳' })).toThrow(/省份\/城市/);
    expect(() => getChart({ ...base, city: '火星' })).toThrow(/未找到/);
    expect(getChart({ ...base, city: '辽宁省/朝阳' }).input.city).toBe('辽宁省/朝阳');
  });
});

describe('get_reading_summary', () => {
  it('returns a one-liner and the 13 dimension titles', () => {
    const summary = getReadingSummary(base);
    expect(summary.oneLiner).toMatch(/^命宫主星为天机（陷）/);
    expect(summary.dimensions.map(d => d.title)).toEqual(DIMENSIONS.map(d => d[1]));
    expect(summary.dimensions).toHaveLength(13);
    expect(summary.dimensions.find(d => d.key === 'career')?.majorStars).toEqual(['巨门（庙）']);
    expect(summary.fullReading.url).toContain('from=mcp');
  });

  it('handles an empty 命宫 by borrowing the opposite palace', () => {
    for (let day = 1; day <= 28; day++) for (let branch = 0; branch < 12; branch++) {
      const s = getReadingSummary({ date: `2001-03-${String(day).padStart(2, '0')}`, branch, gender: 'female' });
      if (!s.mingGong.majorStars.length) {
        expect(s.oneLiner).toMatch(/^命宫无主星，借对宫迁移宫/);
        expect(s.mingGong.borrowedStars?.length).toBeGreaterThan(0);
        return;
      }
    }
    throw new Error('no empty 命宫 found');
  });
});

describe('get_twins', () => {
  it('matches the website estimate', () => {
    const twins = getTwins(base);
    expect(twins.estimatedSameChart).toBe(estimateTwins(1990, 'male', 'china').count);
    expect(twins.url).toBe('https://zw.tokenxiu.com/twins?date=1990-05-15&mode=clock&time=08%3A30&gender=male&from=mcp');
    const world = getTwins({ ...base, gender: 'female', region: 'world' });
    expect(world.region).toBe('world');
    expect(world.estimatedSameChart).toBe(estimateTwins(1990, 'female', 'world').count);
  });
});

describe('copy rules', () => {
  it('never outputs red-line words', () => {
    for (let year = 1950; year <= 2020; year += 10) for (let branch = 0; branch < 12; branch++) {
      const input = { date: `${year}-0${1 + (branch % 9)}-1${branch % 9}`, branch, gender: branch % 2 ? 'female' as const : 'male' as const };
      const text = JSON.stringify([getChart(input), getReadingSummary(input), getTwins(input)]);
      expect(text).not.toMatch(RED_LINE);
    }
  }, 60_000);
});
