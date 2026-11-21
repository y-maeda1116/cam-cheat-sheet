// @vitest-environment happy-dom
/** シーンカードコンポーネントのテスト(DOM 操作のため happy-dom 環境で実行) */

import { beforeEach, describe, expect, it } from "vitest";
import cameraSettings from "../data/cameraSettings.json";
import type { CameraSettingsData, Scene } from "../types";
import { createSceneCard } from "./SceneCard";

const data = cameraSettings as CameraSettingsData;

function setup(scene: Scene): HTMLElement {
  const card = createSceneCard(scene);
  document.body.replaceChildren(card);
  return card;
}

describe("createSceneCard", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it("シーン名・3設定値・失敗例・tips・タグを表示する", () => {
    const scene = data.scenes[0]!;
    const card = setup(scene);

    expect(card.querySelector("h3")?.textContent).toBe(scene.name);
    const dd = [...card.querySelectorAll("dd")].map((el) => el.textContent);
    expect(dd).toHaveLength(3);
    expect(card.textContent).toContain(scene.failure);
    expect(card.querySelectorAll("ul li")).toHaveLength(scene.tips.length);
    expect(card.querySelectorAll(".tag-badge")).toHaveLength(scene.tags.length);
  });

  it("失敗例は警告アイコン付きの注記として描画される", () => {
    const scene = data.scenes[1]!;
    const card = setup(scene);

    const note = card.querySelector("p.flex.items-start");
    expect(note?.textContent).toContain(scene.failure);
    expect(note?.querySelector("svg")).toBeDefined();
  });

  it("aria-label にシーン名を含む", () => {
    const scene = data.scenes[2]!;
    const card = setup(scene);

    expect(card.getAttribute("aria-label")).toBe(`${scene.name}の推奨設定`);
  });
});
