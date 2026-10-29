import {
  calculateTrueSolarTime, formToBirthInfo, isChinaDST, isValidGregorianDate, isValidLunarDate,
  lunarMonthDayCount, lunarToSolar, LUNAR_YEAR_MAX, LUNAR_YEAR_MIN, PROVINCES, shiftGregorianDate,
  type BirthFormState, type BirthInfo,
} from './engine';

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2100;
export const BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export interface BirthInput {
  /** 'solar'（公历，默认）或 'lunar'（农历） */
  calendar?: 'solar' | 'lunar';
  /** YYYY-MM-DD；calendar=lunar 时为农历年月日 */
  date: string;
  /** 农历闰月 */
  leapMonth?: boolean;
  /** 出生钟表时间 HH:MM（与 branch 二选一，优先 time） */
  time?: string;
  /** 出生时辰：0–11 或 子/丑/…/亥 */
  branch?: number | string;
  /** 子时出生时区分晚子时（23:00–23:59，按次日排）；默认早子时 */
  lateZi?: boolean;
  gender: 'male' | 'female';
  /** 出生城市，如「北京」「广东省/深圳」；仅支持中国城市，用于真太阳时校正 */
  city?: string;
  /** 1986–1991 年夏令时期间默认把钟表时间减 1 小时；传 true 表示所填已是标准时间 */
  ignoreDst?: boolean;
}

export interface CityOption { id: string; province: string; city: string; longitude: number }

export const CITY_OPTIONS: CityOption[] = PROVINCES.flatMap(province => province.cities.map(city => ({
  id: `${province.name}/${city.name}`, province: province.name, city: city.name, longitude: city.longitude,
})));

const trimSuffix = (name: string) => name.replace(/(特别行政区|维吾尔自治区|壮族自治区|回族自治区|自治区|省|市)$/u, '');

export function findCity(raw: string): CityOption {
  const text = raw.trim().replace(/[\s·・,，]+/gu, '/');
  const exact = CITY_OPTIONS.find(c => c.id === text);
  if (exact) return exact;
  const [a, b] = text.includes('/') ? text.split('/', 2) : ['', text];
  const matches = CITY_OPTIONS.filter(c =>
    (!a || trimSuffix(c.province) === trimSuffix(a)) && (c.city === b || trimSuffix(c.city) === trimSuffix(b)));
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    const capital = matches.find(c => trimSuffix(c.province) === trimSuffix(c.city));
    if (capital && !a) return capital;
    throw new Error(`城市「${raw}」有多个同名地点，请写成「省份/城市」：${matches.slice(0, 6).map(c => c.id).join('、')}`);
  }
  throw new Error(`未找到城市「${raw}」。目前只支持中国城市，可写成「省份/城市」，例如「广东省/深圳」。`);
}

function parseBranch(value: number | string): number {
  if (typeof value === 'number') {
    if (Number.isInteger(value) && value >= 0 && value <= 11) return value;
  } else {
    const text = value.trim().replace(/时$/u, '');
    const index = BRANCH_NAMES.indexOf(text as typeof BRANCH_NAMES[number]);
    if (index >= 0) return index;
    if (/^(?:\d|1[01])$/.test(text)) return Number(text);
  }
  throw new Error('时辰无效，请填 0–11 或 子、丑、寅、卯、辰、巳、午、未、申、酉、戌、亥。');
}

const pad = (n: number) => String(n).padStart(2, '0');
const ymd = (d: { year: number; month: number; day: number }) => `${d.year}-${pad(d.month)}-${pad(d.day)}`;

export interface ParsedBirth {
  birth: BirthInfo;
  /** 公历出生日期（农历输入已换算） */
  solarDate: string;
  /** 排盘用的时辰（0–11） */
  branch: number;
  city?: CityOption;
  trueSolarTime?: string;
  dstApplied: boolean;
  notes: string[];
  /** 与 zw.tokenxiu.com /chart 页同名的查询参数 */
  siteParams: URLSearchParams;
}

/** 与 zw.tokenxiu.com 的 parseBirthQuery 同口径（仅中国城市）。 */
export function parseBirth(input: BirthInput): ParsedBirth {
  const calendar = input.calendar ?? 'solar';
  const params = new URLSearchParams();
  const notes: string[] = [];
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(input.date?.trim() ?? '');
  if (!match) throw new Error('日期格式应为 YYYY-MM-DD。');
  let [year, month, day] = match.slice(1).map(Number);
  if (calendar === 'lunar') {
    const leap = Boolean(input.leapMonth);
    const min = Math.max(MIN_YEAR, LUNAR_YEAR_MIN), max = Math.min(MAX_YEAR, LUNAR_YEAR_MAX);
    if (year < min || year > max) throw new Error(`农历日期需在 ${min}–${max} 年之间。`);
    if (leap && !lunarMonthDayCount(year, month, true)) throw new Error(`农历 ${year} 年没有闰${month}月。`);
    if (!isValidLunarDate(year, month, day, leap)) throw new Error('农历日期不存在。');
    const solar = lunarToSolar(year, month, day, leap);
    if (!solar) throw new Error('农历日期不存在。');
    params.set('cal', 'lunar');
    params.set('ly', String(year)); params.set('lm', String(month)); params.set('ld', String(day));
    if (leap) params.set('leap', '1');
    ({ year, month, day } = solar);
  } else if (calendar !== 'solar') {
    throw new Error("calendar 只能是 'solar' 或 'lunar'。");
  }
  if (year < MIN_YEAR || year > MAX_YEAR || !isValidGregorianDate(year, month, day)) {
    throw new Error(`请输入 ${MIN_YEAR}–${MAX_YEAR} 年之间真实存在的日期。`);
  }
  const solarDate = ymd({ year, month, day });
  params.set('date', solarDate);
  if (input.gender !== 'male' && input.gender !== 'female') throw new Error("gender 只能是 'male' 或 'female'。");

  let time: string;
  const mode = input.time ? 'clock' : 'branch';
  if (input.time) {
    time = input.time.trim();
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('时间格式应为 HH:MM（24 小时制）。');
    params.set('mode', 'clock'); params.set('time', time);
  } else if (input.branch !== undefined && input.branch !== '') {
    const branch = parseBranch(input.branch);
    time = branch === 0 ? (input.lateZi ? '23:30' : '00:30') : `${pad(branch * 2)}:00`;
    params.set('mode', 'branch'); params.set('branch', String(branch));
    if (branch === 0) params.set('zi', input.lateZi ? 'late' : 'early');
  } else {
    throw new Error('请提供出生时间 time（HH:MM）或时辰 branch。');
  }
  params.set('gender', input.gender);
  const city = input.city?.trim() ? findCity(input.city) : undefined;
  if (city) params.set('city', city.id);

  const [clockHour, clockMinute] = time.split(':').map(Number);
  let standard = { year, month, day, clockHour, clockMinute };
  let dstApplied = false;
  if (isChinaDST(year, month, day)) {
    if (mode !== 'clock' || year < 1986 || year > 1991) {
      notes.push(`${year} 年该日期处于中国夏令时期间，如所填为当时钟表时间，可能需要减 1 小时。`);
    } else if (input.ignoreDst) {
      params.set('dst', 'std');
      notes.push('已按所填时间为标准时间处理，未做夏令时调整。');
    } else {
      const shifted = shiftGregorianDate(standard, clockHour === 0 ? -1 : 0);
      standard = { ...shifted, clockHour: (clockHour + 23) % 24, clockMinute };
      dstApplied = true;
      notes.push(`该日期处于 ${year} 年中国夏令时期间，已把钟表时间减 1 小时（标准时间 ${pad(standard.clockHour)}:${pad(clockMinute)}）。`);
    }
  }
  const solar = city && mode === 'clock' ? calculateTrueSolarTime({ ...standard, longitude: city.longitude }) : null;
  const effective = solar ? shiftGregorianDate(standard, solar.dayOffset) : standard;
  const form: BirthFormState = {
    name: '', year: String(effective.year), month: String(effective.month), day: String(effective.day),
    clockHour: String(solar?.hour ?? standard.clockHour), clockMinute: String(solar?.minute ?? standard.clockMinute),
    unknownTime: false, province: '', city: '', longitude: 120, gender: input.gender,
  };
  const birth = formToBirthInfo(form);
  birth.origInput = { year, month, day, clockHour, clockMinute };
  if (city) Object.assign(birth, { province: city.province, city: city.city, longitude: city.longitude });
  if (mode === 'branch' && city) notes.push('按时辰排盘时不做真太阳时校正。');
  if (birth.hour === 0 && clockHour === 23) notes.push('23:00–23:59 为晚子时，按次日排盘。');
  return {
    birth, solarDate, branch: birth.hour, city, dstApplied, notes, siteParams: params,
    trueSolarTime: solar ? `${pad(solar.hour)}:${pad(solar.minute)}` : undefined,
  };
}
