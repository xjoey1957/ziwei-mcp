// Same algorithm as zw.tokenxiu.com /twins (apps/web/lib/twins/estimate.ts).
const china = [2023,2107,2105,2151,2260,1984,1963,2169,1889,1635,1389,1188,2451,2934,2721,2709,2554,2543,2731,2690,2710,2551,2550,2447,2226,2102,1849,1783,1733,1715,1776,2064,2230,2052,2050,2196,2374,2508,2445,2396,2391,2258,2119,2126,2104,2063,2067,2038,1942,1834,1771,1702,1647,1599,1593,1617,1585,1595,1608,1591,1592,1604,1635,1640,1683,1655,1786,1723,1523,1465,1202,1062,956,902,954];
const world = [[1950,92],[1960,103],[1970,122],[1980,125],[1990,139],[2000,133],[2010,139],[2015,141],[2020,134],[2024,132]];

export function estimateTwins(year: number, gender: 'male' | 'female', region: 'china' | 'world') {
  let births: number;
  if (region === 'china') births = china[Math.max(0, Math.min(china.length - 1, year - 1950))] * 10000;
  else {
    const y = Math.max(1950, Math.min(2024, year));
    const upper = world.findIndex(([point]) => point >= y);
    const [y2, n2] = world[upper];
    const [y1, n1] = world[Math.max(0, upper - 1)];
    births = (y1 === y2 ? n2 : n1 + (n2 - n1) * (y - y1) / (y2 - y1)) * 1000000;
  }
  const days = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365;
  const raw = births / days / 12 * (gender === 'male' ? 0.515 : 0.485);
  return { count: Number(raw.toPrecision(2)), region, year, note: 'public-birth-statistics-estimate' };
}
