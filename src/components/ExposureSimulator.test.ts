// @vitest-environment happy-dom
/** 露出シミュレーターコンポーネントのテスト(DOM 操作のため happy-dom 環境で実行) */

import { beforeEach, describe, expect, it } from "vitest";
import { createExposureSimulator } from "./ExposureSimulator";

function setup(): HTMLElement {
  const root = createExposureSimulator();
  document.body.replaceChildren(root);
  return root;
}

/** 露出オフセット表示(例: "+0.0 EV")を取得する */
function offsetText(root: HTMLElement): string {
  return root.querySelector("p.font-mono.text-lg")?.textContent ?? "";
}

/** aria-label でボタンを取得する */
function button(root: HTMLElement, ariaLabel: string): HTMLButtonElement {
  const btn = root.querySelector(`button[aria-label="${ariaLabel}"]`);
  if (!(btn instanceof HTMLButtonElement)) throw new Error(`button not found: ${ariaLabel}`);
  return btn;
}

describe("createExposureSimulator", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it("初期状態は基準値で露出オフセットが 0 EV", () => {
    const root = setup();

    expect(root.getAttribute("aria-label")).toBe("露出シミュレーター");
    expect(offsetText(root)).toBe("+0.0 EV");
  });

  it("F値ダイヤルを明るく操作するとアンダー方向にオフセットが動く", () => {
    const root = setup();

    // 「F値を明るくする」= F値ステップを進める = 絞り込んで暗く = +EV(アンダー)
    button(root, "F値を明るくする").click();

    expect(offsetText(root)).not.toBe("+0.0 EV");
    expect(offsetText(root)).toMatch(/^\+\d/);
  });

  it("ステップの境界で +/− ボタンが無効化される", () => {
    const root = setup();
    const minus = button(root, "F値を暗くする");
    const plus = button(root, "F値を明るくする");

    // 最小F値まで下げる
    for (let i = 0; i < 20 && !minus.disabled; i++) minus.click();
    expect(minus.disabled).toBe(true);

    // 最大F値まで上げる
    for (let i = 0; i < 20 && !plus.disabled; i++) plus.click();
    expect(plus.disabled).toBe(true);
  });

  it("基準に戻すボタンでオフセット 0 EV に復帰する", () => {
    const root = setup();

    button(root, "F値を明るくする").click();
    button(root, "シャッタースピードを明るくする").click();
    expect(offsetText(root)).not.toBe("+0.0 EV");

    const reset = [...root.querySelectorAll("button")].find((b) => b.textContent === "基準に戻す");
    expect(reset).toBeDefined();
    reset!.click();

    expect(offsetText(root)).toBe("+0.0 EV");
  });
});
