/** 露出計算ロジックのユニットテスト */

import { describe, expect, it } from "vitest";
import {
  APERTURE_STEPS,
  ISO_STEPS,
  REFERENCE,
  SHUTTER_STEPS,
  apertureStopsFromRef,
  blurRiskLevel,
  bokehLevel,
  exposureLabel,
  exposureMeter,
  exposureOffset,
  formatShutter,
  isoStopsFromRef,
  levelLabel,
  nearestStepIndex,
  noiseLevel,
  shutterStopsFromRef,
} from "./exposure";

describe("露出オフセット", () => {
  it("基準値のオフセットは 0", () => {
    expect(exposureOffset(REFERENCE.aperture, REFERENCE.shutterSec, REFERENCE.iso)).toBeCloseTo(0);
  });

  it("F値を絞るとオフセットは正（アンダー方向）", () => {
    expect(apertureStopsFromRef(5.6)).toBeGreaterThan(0);
    expect(apertureStopsFromRef(1.4)).toBeLessThan(0);
  });

  it("F値1ストップ（√2倍）でオフセットは1進む", () => {
    expect(apertureStopsFromRef(2.8 * Math.SQRT2)).toBeCloseTo(1);
    expect(apertureStopsFromRef(2.8 * 2)).toBeCloseTo(2);
  });

  it("シャッターが遅いほど・ISOが高いほど明るい（負）", () => {
    expect(shutterStopsFromRef(REFERENCE.shutterSec * 2)).toBeCloseTo(-1);
    expect(isoStopsFromRef(REFERENCE.iso * 2)).toBeCloseTo(-1);
  });

  it("exposureMeter は ±1 にクランプされる", () => {
    expect(exposureMeter(100)).toBe(1);
    expect(exposureMeter(-100)).toBe(-1);
    expect(exposureMeter(0)).toBe(0);
  });

  it("exposureLabel はオフセットの大きさで段階的に変わる", () => {
    expect(exposureLabel(0)).toBe("適正露出");
    expect(exposureLabel(-1)).toBe("やや明るい");
    expect(exposureLabel(-5)).toBe("かなり明るい（オーバー気味）");
    expect(exposureLabel(1)).toBe("やや暗い");
    expect(exposureLabel(5)).toBe("かなり暗い（アンダー気味）");
  });
});

describe("写りへの影響指標", () => {
  it("bokehLevel は開放で1・絞り切りで0", () => {
    expect(bokehLevel(1.4)).toBe(1);
    expect(bokehLevel(22)).toBe(0);
  });

  it("blurRiskLevel は1/1000秒で0・1秒で1", () => {
    expect(blurRiskLevel(1 / 1000)).toBe(0);
    expect(blurRiskLevel(1)).toBe(1);
  });

  it("noiseLevel は ISO100 で0・ISO25600 で1", () => {
    expect(noiseLevel(100)).toBe(0);
    expect(noiseLevel(25600)).toBe(1);
  });

  it("levelLabel は3段階で切り替わる", () => {
    const label = (v: number) => levelLabel(v, "低", "中", "高");
    expect(label(0)).toBe("低");
    expect(label(0.5)).toBe("中");
    expect(label(1)).toBe("高");
  });
});

describe("表示変換", () => {
  it("formatShutter は1秒以上をダブルプライム、未満を分数で返す", () => {
    expect(formatShutter(30)).toBe('30"');
    expect(formatShutter(1 / 250)).toBe("1/250");
  });

  it("nearestStepIndex は対数スケールで最も近いステップを返す", () => {
    expect(nearestStepIndex(APERTURE_STEPS, 2.9)).toBe(3); // 2.8
    expect(nearestStepIndex(ISO_STEPS, 900)).toBe(3); // 800
    expect(nearestStepIndex(SHUTTER_STEPS, 1 / 260)).toBe(12); // 1/250
  });
});
