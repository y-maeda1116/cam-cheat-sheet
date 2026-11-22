/** 露出シミュレーターコンポーネント（3ダイヤル + 露出計 + 指標） */

import {
  APERTURE_STEPS,
  ISO_STEPS,
  ND_STEPS,
  REFERENCE,
  SHUTTER_STEPS,
  exposureLabel,
  exposureMeter,
  exposureOffset,
  formatShutter,
  nearestStepIndex,
  suggestCompensation,
} from "../lib/exposure";
import type { SimulatorValues } from "../lib/urlState";
import { el } from "./dom";
import { createPreviewScene } from "./PreviewScene";

/** ND フィルターの表示ラベル（ND_STEPS と同順） */
const ND_LABELS = ["なし", "ND8", "ND64", "ND1000"] as const;

/** ダイヤルの状態（ステップ配列のインデックスで管理する） */
interface DialState {
  aperture: number;
  shutter: number;
  iso: number;
  nd: number;
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
export interface ExposureSimulatorOptions {
  /** 復元する初期値（URL共有など） */
  initial?: SimulatorValues;
  /** ダイヤル操作で値が変わるたびに呼ばれる */
  onChange?: (values: SimulatorValues) => void;
}

export function createExposureSimulator(options: ExposureSimulatorOptions = {}): HTMLElement {
  const state: DialState = {
    aperture: nearestStepIndex(APERTURE_STEPS, options.initial?.aperture ?? REFERENCE.aperture),
    shutter: nearestStepIndex(SHUTTER_STEPS, options.initial?.shutterSec ?? REFERENCE.shutterSec),
    iso: nearestStepIndex(ISO_STEPS, options.initial?.iso ?? REFERENCE.iso),
    nd: nearestStepIndex(ND_STEPS, options.initial?.nd ?? 0),
  };

  const preview = createPreviewScene();

  // 露出計（中央基準・右寄り＝アンダー）
  const meterFill = el("div", "exposure-meter-fill");
  const meterTrack = el("div", "exposure-meter-track");
  meterTrack.append(meterFill);
  meterTrack.append(el("div", "exposure-meter-center"));

  const meterOffset = el("p", "font-mono text-lg font-semibold text-lcd");
  const meterLabel = el("p", "text-xs text-dim");
  const meterSuggest = el("p", "text-xs text-lcd");

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

    const ndStops = ND_STEPS[state.nd]!;
    const offset = exposureOffset(aperture, shutterSec, iso, ndStops);
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

    const suggestion = suggestCompensation(aperture, shutterSec, iso, ndStops);
    if (suggestion === null) {
      meterSuggest.textContent = "";
    } else if (suggestion.dial === "shutter") {
      meterSuggest.textContent = `適正へ寄せる例: シャッター ${formatShutter(suggestion.from)} → ${formatShutter(suggestion.to)}`;
    } else {
      meterSuggest.textContent = `適正へ寄せる例: ISO ${suggestion.from} → ISO ${suggestion.to}`;
    }

    preview.update(aperture, shutterSec, iso);
    options.onChange?.({ aperture, shutterSec, iso, nd: ndStops });
  };

  const createDial = (
    label: string,
    key: keyof DialState,
    steps: readonly number[],
    format: (value: number) => string,
    ariaDesc: string
  ): HTMLElement => {
    const value = el("p", "font-mono text-xl font-semibold text-ink");
    const minus = el("button", "dial-button", "−");
    minus.type = "button";
    minus.setAttribute("aria-label", `${label}を暗くする`);
    const plus = el("button", "dial-button", "＋");
    plus.type = "button";
    plus.setAttribute("aria-label", `${label}を明るくする`);

    const move = (delta: number): void => {
      state[key] = Math.max(0, Math.min(steps.length - 1, state[key] + delta));
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
    state.nd = 0;
    render();
  });

  const dials = el("div", "grid gap-6 sm:grid-cols-2 lg:grid-cols-4");
  dials.append(
    createDial("F値", "aperture", APERTURE_STEPS, (v) => `f/${v}`, "数値が大きいほど暗い"),
    createDial(
      "シャッタースピード",
      "shutter",
      SHUTTER_STEPS,
      formatShutter,
      "速度が遅いほど明るい"
    ),
    createDial("ISO感度", "iso", ISO_STEPS, (v) => `ISO ${v}`, "感度が高いほど明るい"),
    createDial(
      "NDフィルター",
      "nd",
      ND_STEPS,
      (v) => ND_LABELS[ND_STEPS.findIndex((step) => step === v)] ?? "なし",
      "減光量が多いほど暗い"
    )
  );

  const meterSection = el("div", "flex flex-col gap-2");
  const meterHead = el("div", "flex items-baseline justify-between gap-4");
  meterHead.append(
    el("p", "text-xs text-dim", "露出オフセット（基準 f/2.8・1/125秒・ISO 400）"),
    meterOffset
  );
  meterSection.append(meterHead, meterTrack, meterLabel, meterSuggest);

  const indicators = el("div", "flex flex-col gap-4");
  indicators.append(el("p", "text-xs text-dim", "設定が写りに与える影響"), preview.root);

  const head = el("div", "flex items-baseline justify-between gap-4");
  head.append(el("h2", "text-lg font-bold text-ink", "露出シミュレーター"), reset);

  const root = el("section", "rounded-xl border border-line bg-panel p-6 flex flex-col gap-6");
  root.setAttribute("aria-label", "露出シミュレーター");
  root.append(head, dials, meterSection, indicators);

  render();
  return root;
}
