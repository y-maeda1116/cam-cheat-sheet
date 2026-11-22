/** 露出計算ロジックのユニットテスト */

import { describe, expect, it } from "vitest";
import {
  APERTURE_STEPS,
  ISO_STEPS,
  ND_STEPS,
  REFERENCE,
  SHUTTER_STEPS,
  apertureStopsFromRef,
  blurRiskLevel,
  bokehLevel,
  exposureLabel,
  exposureMeter,
  exposureOffset,
  suggestCompensation,
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

describe("ND フィルター", () => {
  it("ND_STEPS は減光ストップ数の昇順で定義されている", () => {
    expect(ND_STEPS).toEqual([0, 3, 6, 10]);
  });

  it("ND は露出オフセットをアンダー側に加算する", () => {
    const without = exposureOffset(8, 4, 100);
    const withNd = exposureOffset(8, 4, 100, 6);
    expect(withNd - without).toBeCloseTo(6, 10);
  });
});

describe("suggestCompensation（適正化提案）", () => {
  it("適正圏内（|offset| < 0.5）では提案しない", () => {
    expect(suggestCompensation(REFERENCE.aperture, REFERENCE.shutterSec, REFERENCE.iso)).toBeNull();
  });

  it("アンダー時はシャッターを遅くする方向を提案する", () => {
    // f/16, 1/125, ISO 400 → +5.0EV アンダー → 1/4秒 で約 0EV
    expect(suggestCompensation(16, 1 / 125, 400)).toEqual({
      dial: "shutter",
      from: 1 / 125,
      to: 0.25,
    });
  });

  it("シャッターが限界のときは ISO で提案する", () => {
    // f/1.4, 1/4000, ISO 6400 → -1EV オーバー。シャッターは最速で打ち止め
    expect(suggestCompensation(1.4, 1 / 4000, 6400)).toEqual({
      dial: "iso",
      from: 6400,
      to: 3200,
    });
  });

  it("ND 分を含めたオフセットで提案する", () => {
    // f/8, 4秒, ISO 100, ND64(6) → +1.6EV アンダー → 15秒 で約 0EV
    expect(suggestCompensation(8, 4, 100, 6)).toEqual({
      dial: "shutter",
      from: 4,
      to: 15,
    });
  });

  it("現在値がダイヤル格子外でも最近傍ステップへの提案を返す", () => {
    // 1/89秒相当（格子外）→ 最近傍の 1/125秒 へ丸めた提案になる
    const suggestion = suggestCompensation(2.8, (1 / 125) * 2 ** 0.5, 400);
    expect(suggestion?.dial).toBe("shutter");
    expect(suggestion?.to).toBe(1 / 125);
  });
});
