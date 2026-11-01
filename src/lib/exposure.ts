/**
 * 露出の3要素（F値・シャッタースピード・ISO）の計算ロジック。
 * 基準値（f/2.8, 1/125秒, ISO 400）からのストップ数で露出バランスを表す。
 * 純粋関数のみで構成し、ユニットテスト対象とする。
 */

/** 基準となる設定（露出オフセット 0 の定義） */
export const REFERENCE = {
  aperture: 2.8,
  shutterSec: 1 / 125,
  iso: 400,
} as const;

/** ダイヤルで選択可能なF値（標準ステップ） */
export const APERTURE_STEPS = [1.4, 1.8, 2, 2.8, 4, 5.6, 8, 11, 16, 22] as const;

/** シャッタースピードのステップ（秒） */
export const SHUTTER_STEPS = [
  30,
  15,
  8,
  4,
  2,
  1,
  0.5,
  0.25,
  0.125,
  1 / 30,
  1 / 60,
  1 / 125,
  1 / 250,
  1 / 500,
  1 / 1000,
  1 / 2000,
  1 / 4000,
] as const;

/** ISO感度のステップ */
export const ISO_STEPS = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600] as const;

/**
 * F値の基準からのストップ数（明るいほど負、暗いほど正）。
 * F値は1ストップで √2 倍になるため 2*log2 で計算。
 */
export function apertureStopsFromRef(aperture: number): number {
  return 2 * Math.log2(aperture / REFERENCE.aperture);
}

/** シャッタースピードの基準からのストップ数（長いほど負＝明るい） */
export function shutterStopsFromRef(shutterSec: number): number {
  return -Math.log2(shutterSec / REFERENCE.shutterSec);
}

/** ISOの基準からのストップ数（低いほど正＝暗い） */
export function isoStopsFromRef(iso: number): number {
  return -Math.log2(iso / REFERENCE.iso);
}

/**
 * 3要素を合算した露出オフセット（ストップ数）。
 * - 0    → 適正露出（基準どおり）
 * - 正   → アンダー（暗すぎる）
 * - 負   → オーバー（明るすぎる）
 */
export function exposureOffset(aperture: number, shutterSec: number, iso: number): number {
  return apertureStopsFromRef(aperture) + shutterStopsFromRef(shutterSec) + isoStopsFromRef(iso);
}

/** 露出オフセットを -1..1 のメーター値に変換（正＝アンダー側） */
export function exposureMeter(offset: number, fullScaleStops = 4): number {
  const clamped = Math.max(-fullScaleStops, Math.min(fullScaleStops, offset));
  return clamped / fullScaleStops;
}

/** 露出状態のラベル */
export function exposureLabel(offset: number): string {
  if (offset <= -1.5) return "かなり明るい（オーバー気味）";
  if (offset <= -0.5) return "やや明るい";
  if (offset < 0.5) return "適正露出";
  if (offset < 1.5) return "やや暗い";
  return "かなり暗い（アンダー気味）";
}

/** 値を 0..1 にクランプする */
function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

/**
 * F値からボケ量（0..1）を算出。
 * 開放（1.4）で 1、絞り切り（22）で 0。対数スケールで補間。
 */
export function bokehLevel(aperture: number): number {
  const min = 2 * Math.log2(1.4 / 1.4);
  const max = 2 * Math.log2(22 / 1.4);
  const value = 2 * Math.log2(aperture / 1.4);
  return clamp01(1 - (value - min) / (max - min));
}

/**
 * シャッタースピードから手ブレ・被写体ブレのリスク（0..1）を算出。
 * 1/1000秒 で 0、1秒 で 1。対数スケールで補間。
 */
export function blurRiskLevel(shutterSec: number): number {
  return clamp01(Math.log2(shutterSec * 1000) / 10);
}

/** ISOからノイズ量（0..1）を算出。ISO 100 で 0、ISO 25600 で 1。 */
export function noiseLevel(iso: number): number {
  return clamp01(Math.log2(iso / 100) / Math.log2(256));
}

/** レベル（0..1）を3段階ラベルに変換 */
export function levelLabel(level: number, low: string, mid: string, high: string): string {
  if (level < 0.34) return low;
  if (level < 0.67) return mid;
  return high;
}

/** シャッタースピード（秒）を表示用ラベルに変換 */
export function formatShutter(shutterSec: number): string {
  if (shutterSec >= 1) return `${shutterSec}"`;
  const denominator = Math.round(1 / shutterSec);
  return `1/${denominator}`;
}

/** 最も近いダイヤルステップのインデックスを求める */
export function nearestStepIndex(steps: readonly number[], value: number): number {
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < steps.length; i++) {
    const diff = Math.abs(Math.log2(steps[i]!) - Math.log2(value));
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return best;
}
