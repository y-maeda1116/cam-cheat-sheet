// @vitest-environment happy-dom
/** 指標表示コンポーネントのテスト(DOM 操作のため happy-dom 環境で実行) */

import { beforeEach, describe, expect, it } from "vitest";
import { createPreviewScene } from "./PreviewScene";

function setup() {
  const scene = createPreviewScene();
  document.body.replaceChildren(scene.root);
  return scene;
}

/** 指標行（ラベル・バー・状態）をDOM順で取得する */
function statuses(root: HTMLElement): string[] {
  return [...root.querySelectorAll("p.font-mono")].map((p) => p.textContent ?? "");
}

describe("createPreviewScene", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it("ボケ・ブレ・ノイズの3指標行を生成する", () => {
    const { root } = setup();

    const labels = [...root.querySelectorAll("p.text-xs.text-dim")].map((p) => p.textContent);
    expect(labels).toEqual(["ボケ量", "ブレリスク", "ノイズ"]);
  });

  it("update で指標の状態テキストとバー幅が変わる", () => {
    const { root, update } = setup();

    update(1.4, 30, 25600);

    expect(statuses(root)).toEqual(["大きくボケる", "ブレやすい", "ノイズ多め"]);
    const fills = [...root.querySelectorAll<HTMLElement>(".meter-fill")];
    for (const fill of fills) {
      expect(fill.style.width).toBe("100%");
    }

    update(22, 1 / 4000, 100);

    expect(statuses(root)).toEqual(["パンフォーカス", "ブレにくい", "ノイズ少なめ"]);
  });

  it("高リスク時のみブレ・ノイズのバーが警告色になる", () => {
    const { root, update } = setup();

    update(2.8, 1 / 125, 400);
    let fills = [...root.querySelectorAll<HTMLElement>(".meter-fill")];
    expect(fills.map((f) => f.dataset.warn)).toEqual(["false", "false", "false"]);

    update(2.8, 1, 6400);
    fills = [...root.querySelectorAll<HTMLElement>(".meter-fill")];
    expect(fills.map((f) => f.dataset.warn)).toEqual(["false", "true", "true"]);
  });
});
