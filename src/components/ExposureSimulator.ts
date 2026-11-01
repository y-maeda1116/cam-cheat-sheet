/** 露出シミュレーターコンポーネント（3ダイヤル + 露出計 + 指標） */

import {
  APERTURE_STEPS,
  ISO_STEPS,
  REFERENCE,
  SHUTTER_STEPS,
  exposureLabel,
  exposureMeter,
  exposureOffset,
  formatShutter,
  nearestStepIndex,
} from "../lib/exposure";
import { el } from "./dom";
import { createPreviewScene } from "./PreviewScene";

/** ダイヤルの状態（ステップ配列のインデックスで管理する） */
interface DialState {
  aperture: number;
  shutter: number;
  iso: number;
}

/** ダイヤル1個分の DOM 参照 */
interface DialRefs {
  value: HTMLElement;
  minus: HTMLButtonElement;
  plus: HTMLButtonElement;
  key: keyof DialState;
  steps: readonly number[];
  format: (value: number) => string;
}

/**
 * 露出シミュレーターを生成する。
 * 基準値（f/2.8, 1/125秒, ISO 400）からのオフセットで適正露出を判定し、
 * F値・シャッター・ISOのダイヤル操作で露出計と3指標を更新する。
 */
export function createExposureSimulator(): HTMLElement {
  const state: DialState = {
    aperture: nearestStepIndex(APERTURE_STEPS, REFERENCE.aperture),
    shutter: nearestStepIndex(SHUTTER_STEPS, REFERENCE.shutterSec),
    iso: nearestStepIndex(ISO_STEPS, REFERENCE.iso),
  };

  const preview = createPreviewScene();

  // 露出計（中央基準・右寄り＝アンダー）
  const meterFill = el("div", "exposure-meter-fill");
  const meterTrack = el("div", "exposure-meter-track");
  meterTrack.append(meterFill);
  meterTrack.append(el("div", "exposure-meter-center"));

  const meterOffset = el("p", "font-mono text-lg font-semibold text-lcd");
  const meterLabel = el("p", "text-xs text-dim");

  const dialRefs: DialRefs[] = [];

  const render = (): void => {
    const aperture = APERTURE_STEPS[state.aperture]!;
    const shutterSec = SHUTTER_STEPS[state.shutter]!;
    const iso = ISO_STEPS[state.iso]!;

    for (const dial of dialRefs) {
      const value = dial.steps[state[dial.key]]!;
      dial.value.textContent = dial.format(value);
      dial.minus.disabled = state[dial.key] === 0;
      dial.plus.disabled = state[dial.key] === dial.steps.length - 1;
    }

    const offset = exposureOffset(aperture, shutterSec, iso);
    const meter = exposureMeter(offset);
    const width = Math.round(Math.abs(meter) * 50);
    if (meter >= 0) {
      meterFill.style.left = "50%";
      meterFill.style.width = `${width}%`;
    } else {
      meterFill.style.left = `${50 - width}%`;
      meterFill.style.width = `${width}%`;
    }
    meterFill.dataset.side = meter >= 0 ? "under" : "over";
    meterOffset.textContent = `${offset >= 0 ? "+" : ""}${offset.toFixed(1)} EV`;
    meterLabel.textContent = exposureLabel(offset);

    preview.update(aperture, shutterSec, iso);
  };

  const createDial = (
    label: string,
    key: keyof DialState,
    steps: readonly number[],
    format: (value: number) => string,
    ariaDesc: string,
  ): HTMLElement => {
    const value = el("p", "font-mono text-xl font-semibold text-ink");
    const minus = el("button", "dial-button", "−");
    minus.type = "button";
    minus.setAttribute("aria-label", `${label}を暗くする`);
    const plus = el("button", "dial-button", "＋");
    plus.type = "button";
    plus.setAttribute("aria-label", `${label}を明るくする`);

    const move = (delta: number): void => {
      state[key] = Math.max(
        0,
        Math.min(steps.length - 1, state[key] + delta),
      );
      render();
    };
    minus.addEventListener("click", () => move(-1));
    plus.addEventListener("click", () => move(1));

    const controls = el("div", "flex items-center gap-3");
    controls.append(minus, value, plus);

    const cell = el("div", "flex flex-col gap-2");
    cell.append(el("p", "text-xs text-dim", label), controls);
    cell.setAttribute("aria-label", `${label}（${ariaDesc}）`);

    dialRefs.push({ value, minus, plus, key, steps, format });
    return cell;
  };

  const reset = el("button", "reset-button", "基準に戻す");
  reset.type = "button";
  reset.addEventListener("click", () => {
    state.aperture = nearestStepIndex(APERTURE_STEPS, REFERENCE.aperture);
    state.shutter = nearestStepIndex(SHUTTER_STEPS, REFERENCE.shutterSec);
    state.iso = nearestStepIndex(ISO_STEPS, REFERENCE.iso);
    render();
  });

  const dials = el(
    "div",
    "grid gap-6 sm:grid-cols-3",
  );
  dials.append(
    createDial("F値", "aperture", APERTURE_STEPS, (v) => `f/${v}`, "数値が大きいほど暗い"),
    createDial(
      "シャッタースピード",
      "shutter",
      SHUTTER_STEPS,
      formatShutter,
      "速度が遅いほど明るい",
    ),
    createDial("ISO感度", "iso", ISO_STEPS, (v) => `ISO ${v}`, "感度が高いほど明るい"),
  );

  const meterSection = el("div", "flex flex-col gap-2");
  const meterHead = el("div", "flex items-baseline justify-between gap-4");
  meterHead.append(
    el("p", "text-xs text-dim", "露出オフセット（基準 f/2.8・1/125秒・ISO 400）"),
    meterOffset,
  );
  meterSection.append(meterHead, meterTrack, meterLabel);

  const indicators = el("div", "flex flex-col gap-4");
  indicators.append(
    el("p", "text-xs text-dim", "設定が写りに与える影響"),
    preview.root,
  );

  const head = el("div", "flex items-baseline justify-between gap-4");
  head.append(
    el("h2", "text-lg font-bold text-ink", "露出シミュレーター"),
    reset,
  );

  const root = el(
    "section",
    "rounded-xl border border-line bg-panel p-6 flex flex-col gap-6",
  );
  root.setAttribute("aria-label", "露出シミュレーター");
  root.append(head, dials, meterSection, indicators);

  render();
  return root;
}
