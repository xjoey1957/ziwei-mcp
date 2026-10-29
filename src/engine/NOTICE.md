# 引擎来源 / Engine attribution

本目录的排盘引擎源码来自 [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu) 的 `lib/ziwei/`（基于 [iztro](https://github.com/SylarLong/iztro) 修正），MIT 许可证，原始许可证保存在 [LICENSE](./LICENSE)。

The chart engine in this directory comes from `lib/ziwei/` of [Renhuai123/ziwei-doushu](https://github.com/Renhuai123/ziwei-doushu) (built on [iztro](https://github.com/SylarLong/iztro)), MIT licensed. The original license is kept in [LICENSE](./LICENSE).

## 收录的文件

`algorithm.ts`、`birth-form-state.ts`、`cities.ts`、`constants.ts`、`dst-cn.ts`、`lunar-javascript.d.ts`、`lunar-solar.ts`、`school-config.ts`、`school-data.ts`、`school-tables.generated.ts`、`share.ts`、`true-solar-time.ts`、`types.ts`。`index.ts` 为本仓库新增的导出入口。

## 相对上游的改动

- 只保留排盘所需文件；未收录 `famous.ts`、`heming-knowledge.ts`、`patterns.ts`、`sihua.ts` 等解读与案例文件，也未收录上游 `lib/nihai/`、`docs/tianji-ziwei/` 的任何内容。
- `constants.ts` 删除了未被排盘使用的主星描述表 `STAR_DESCRIPTIONS`。
- 若干注释中引用特定人物或站内页面的说法改为中性描述；排盘算法和数据表未改动。
- `birth-form-state.ts` 来自上游 `components/BirthForm.tsx` 中的 `BirthFormState` 接口。
