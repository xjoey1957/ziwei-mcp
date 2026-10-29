import { BRANCHES, generateChart, setBrightnessSchool, STEMS, type ZiweiChart } from './engine';
import { BRANCH_NAMES, parseBirth, type BirthInput, type ParsedBirth } from './birth';
import { estimateTwins } from './twins';

export const SITE = 'https://zw.tokenxiu.com';
export const DISCLAIMER = '传统文化参考：内容不构成任何预测，也不构成医疗、法律、投资建议。';
export const ATTRIBUTION = '排盘引擎来自 github.com/Renhuai123/ziwei-doushu（MIT，基于 iztro）';

/** 与网站一致：解读数据集按 XD2 亮度表生成，命盘图也用同一张表。 */
const BRIGHTNESS_SCHOOL = 'XD2' as const;

export function siteLink(path: '/chart' | '/twins', parsed: ParsedBirth): string {
  const params = new URLSearchParams(parsed.siteParams);
  params.set('from', 'mcp');
  return `${SITE}${path}?${params.toString()}`;
}

function buildChart(parsed: ParsedBirth): ZiweiChart {
  setBrightnessSchool(BRIGHTNESS_SCHOOL);
  return generateChart(parsed.birth);
}

const STAR_TYPE = { major: '主星', lucky: '吉星', sha: '煞星', minor: '杂曜' } as const;

function inputSummary(parsed: ParsedBirth) {
  const b = parsed.birth;
  return {
    solarDate: parsed.solarDate,
    chartDate: `${b.year}-${String(b.month).padStart(2, '0')}-${String(b.day).padStart(2, '0')}`,
    branch: `${BRANCH_NAMES[parsed.branch]}时`,
    gender: b.gender === 'male' ? '男' : '女',
    ...(parsed.city ? { city: parsed.city.id } : {}),
    ...(parsed.trueSolarTime ? { trueSolarTime: parsed.trueSolarTime } : {}),
    ...(parsed.notes.length ? { notes: parsed.notes } : {}),
  };
}

function lunarLabel(chart: ZiweiChart): string {
  const l = chart.lunarInfo;
  return `${STEMS[l.yearStem]}${BRANCHES[l.yearBranch]}年${l.isLeapMonth ? '闰' : ''}${Math.abs(l.lunarMonth)}月${l.lunarDay}日`;
}

/** 十二宫按命宫起逆时针顺序：命宫、兄弟、夫妻…父母。 */
function orderedPalaces(chart: ZiweiChart) {
  const start = chart.palaces.findIndex(p => p.isMingGong);
  return chart.palaces.map((_, i) => chart.palaces[(start - i + 12) % 12]);
}

export function getChart(input: BirthInput) {
  const parsed = parseBirth(input);
  const chart = buildChart(parsed);
  return {
    input: inputSummary(parsed),
    lunar: lunarLabel(chart),
    fourPillars: chart.lunarInfo.fourPillars,
    yinYangGender: chart.yinYangGender,
    wuxingJu: chart.wuxingJuName,
    mingZhu: chart.mingZhu,
    shenZhu: chart.shenZhu,
    mingGong: BRANCHES[chart.mingGongBranch],
    shenGong: BRANCHES[chart.shenGongBranch],
    palaces: orderedPalaces(chart).map(p => ({
      name: p.name,
      branch: BRANCHES[p.branch],
      stem: STEMS[p.stem],
      ...(p.isShenGong ? { isShenGong: true } : {}),
      daXian: p.daXianAge,
      majorStars: p.stars.filter(s => s.type === 'major').map(s => ({
        name: s.name, ...(s.brightnessRaw ? { brightness: s.brightnessRaw } : {}), ...(s.siHua ? { siHua: `化${s.siHua}` } : {}),
      })),
      otherStars: p.stars.filter(s => s.type !== 'major').map(s => ({
        name: s.name, type: STAR_TYPE[s.type], ...(s.brightnessRaw ? { brightness: s.brightnessRaw } : {}), ...(s.siHua ? { siHua: `化${s.siHua}` } : {}),
      })),
      ...(p.isEmpty ? { emptyPalace: true, borrowedFrom: p.borrowedFromName, borrowedStars: p.borrowedStars } : {}),
    })),
    daXian: chart.daXians.map(d => ({ age: `${d.startAge}-${d.endAge}`, palace: d.palaceName, branch: BRANCHES[d.palaceBranch] })),
    url: siteLink('/chart', parsed),
    disclaimer: DISCLAIMER,
    source: ATTRIBUTION,
  };
}

/** 网站 13 维解读的维度标题，以及各维度传统上主要参看的宫位。 */
export const DIMENSIONS = [
  ['overview', '命格总览', '命宫'], ['personality', '性格', '命宫'], ['love', '感情', '夫妻'],
  ['career', '事业', '官禄'], ['wealth', '财运', '财帛'], ['health', '作息与压力', '疾厄'],
  ['family', '兄弟', '兄弟'], ['children', '子女', '子女'], ['move', '迁移', '迁移'],
  ['friends', '人际', '仆役'], ['home', '田宅', '田宅'], ['spirit', '福德', '福德'], ['parents', '父母', '父母'],
] as const;

/** 主星的中性特质描述（本仓库自写，非引用）。 */
export const STAR_TRAITS: Record<string, string> = {
  紫微: '有主见、重自尊、擅长统筹', 天机: '爱思考、善谋划、懂变通', 太阳: '外向热心、重名誉、乐于付出',
  武曲: '务实果断、重执行、对数字敏感', 天同: '性情温和、随和知足、重视生活感受', 廉贞: '有原则、有才艺、情感丰富',
  天府: '稳重踏实、善于积累、重视安全感', 太阴: '细腻内敛、重视家庭、做事有条理', 贪狼: '兴趣广泛、善交际、多才多艺',
  巨门: '善表达、爱钻研、重分析', 天相: '重协调、守规矩、乐于辅助他人', 天梁: '有责任感、爱照顾人、重原则',
  七杀: '独立果敢、敢闯敢拼、行动力强', 破军: '求新求变、敢于开创、不拘一格',
};

function starsOf(chart: ZiweiChart, palaceName: string) {
  const p = chart.palaces.find(x => x.name === palaceName)!;
  const own = p.stars.filter(s => s.type === 'major').map(s => `${s.name}${s.brightnessRaw ? `（${s.brightnessRaw}）` : ''}${s.siHua ? `化${s.siHua}` : ''}`);
  return { palace: p, own, names: own.length ? p.stars.filter(s => s.type === 'major').map(s => s.name) : (p.borrowedStars ?? []) };
}

export function getReadingSummary(input: BirthInput) {
  const parsed = parseBirth(input);
  const chart = buildChart(parsed);
  const ming = starsOf(chart, '命宫');
  const traits = ming.names.map(n => STAR_TRAITS[n]).filter(Boolean).join('；');
  const oneLiner = ming.own.length
    ? `命宫主星为${ming.own.join('、')}，传统上常用「${traits}」来描述这类命宫的性格底色。`
    : `命宫无主星，借对宫${ming.palace.borrowedFromName ?? '迁移'}宫的${ming.names.join('、')}参看，传统上常用「${traits}」来描述，且更容易随环境调整自己。`;
  const url = siteLink('/chart', parsed);
  return {
    input: inputSummary(parsed),
    mingGong: { branch: BRANCHES[chart.mingGongBranch], majorStars: ming.own, ...(ming.own.length ? {} : { borrowedStars: ming.names }) },
    wuxingJu: chart.wuxingJuName,
    oneLiner,
    dimensions: DIMENSIONS.map(([key, title, palaceName]) => {
      const s = starsOf(chart, palaceName);
      return { key, title, palace: `${palaceName === '命宫' ? '命宫' : `${palaceName}宫`}`, majorStars: s.own.length ? s.own : s.names.map(n => `${n}（借对宫）`) };
    }),
    fullReading: { url, note: '13 个维度的完整解读（含各维度要点与段落）在网站免费查看。' },
    disclaimer: DISCLAIMER,
    source: ATTRIBUTION,
  };
}

export function getTwins(input: BirthInput & { region?: 'china' | 'world' }) {
  const parsed = parseBirth(input);
  const region = input.region ?? 'china';
  const year = Number(parsed.solarDate.slice(0, 4));
  const estimate = estimateTwins(year, input.gender, region);
  return {
    input: inputSummary(parsed),
    region,
    estimatedSameChart: estimate.count,
    explanation: `按 ${year} 年${region === 'china' ? '中国' : '全球'}出生人口、当日 12 个时辰平均分布、${input.gender === 'male' ? '男' : '女'}性占比估算，同一天同一时辰出生的同性别人数约 ${estimate.count.toLocaleString('zh-CN')} 人，他们的命盘结构与你相同。`,
    method: '年出生人数 ÷ 当年天数 ÷ 12 时辰 × 性别占比（男 51.5%、女 48.5%），保留两位有效数字。数据来自公开的年度出生人口统计（全球数据按年份线性插值），只是量级估算。',
    url: siteLink('/twins', parsed),
    disclaimer: DISCLAIMER,
  };
}
