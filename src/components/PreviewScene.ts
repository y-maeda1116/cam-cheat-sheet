/** シミュレーター結果の指標表示コンポーネント */

import { blurRiskLevel, bokehLevel, levelLabel, noiseLevel } from "../lib/exposure";
import { el } from "./dom";

export interface PreviewScene {
  root: HTMLElement;
  /** 現在のダイヤル値で指標バーを更新する */
  update: (aperture: number, shutterSec: number, iso: number) => void;
}

/** 指標1行分の DOM（ラベル・バー・状態テキスト） */
interface IndicatorRow {
  fill: HTMLElement;
  status: HTMLElement;
  /** レベル 0.67 以上でバーを警告色にするか */
  warnWhenHigh: boolean;
  low: string;
  mid: string;
  high: string;
}

/** 指標行の定義 */
const INDICATORS: readonly {
  label: string;
  level: (aperture: number, shutterSec: number, iso: number) => number;
  warnWhenHigh: boolean;
  low: string;
  mid: string;
  high: string;
}[] = [
  {
    label: "ボケ量",
    level: (aperture) => bokehLevel(aperture),
    warnWhenHigh: false,
    low: "パンフォーカス",
    mid: "ほどよくボケる",
    high: "大きくボケる",
  },
  {
    label: "ブレリスク",
    level: (_aperture, shutterSec) => blurRiskLevel(shutterSec),
    warnWhenHigh: true,
    low: "ブレにくい",
    mid: "ブレ注意",
    high: "ブレやすい",
  },
  {
    label: "ノイズ",
    level: (_aperture, _shutterSec, iso) => noiseLevel(iso),
    warnWhenHigh: true,
    low: "ノイズ少なめ",
    mid: "ノイズややあり",
    high: "ノイズ多め",
  },
];

/** 「設定が写りに与える影響」の3指標バーを生成する */
export function createPreviewScene(): PreviewScene {
  const rows: IndicatorRow[] = [];
  const root = el("div", "grid gap-4 sm:grid-cols-3");

  for (const def of INDICATORS) {
    const cell = el("div", "flex flex-col gap-2");
    cell.append(el("p", "text-xs text-dim", def.label));

    const track = el("div", "meter-track");
    const fill = el("div", "meter-fill");
    track.append(fill);
    cell.append(track);

    const status = el("p", "font-mono text-xs text-ink");
    cell.append(status);

    root.append(cell);
    rows.push({
      fill,
      status,
      warnWhenHigh: def.warnWhenHigh,
      low: def.low,
      mid: def.mid,
      high: def.high,
    });
  }

  const update = (aperture: number, shutterSec: number, iso: number): void => {
    INDICATORS.forEach((def, index) => {
      const row = rows[index]!;
      const level = def.level(aperture, shutterSec, iso);
      row.fill.style.width = `${Math.round(level * 100)}%`;
      row.fill.dataset.warn = row.warnWhenHigh && level >= 0.67 ? "true" : "false";
      row.status.textContent = levelLabel(level, row.low, row.mid, row.high);
    });
  };

  return { root, update };
}
