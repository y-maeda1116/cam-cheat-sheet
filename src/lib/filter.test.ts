/** シーン検索・タグ絞り込みのユニットテスト */

import { describe, expect, it } from "vitest";
import cameraSettings from "../data/cameraSettings.json";
import type { CameraSettingsData, Scene } from "../types";
import { collectTagIds, filterScenes } from "./filter";

const data = cameraSettings as CameraSettingsData;
const scenes = data.scenes as Scene[];

describe("filterScenes", () => {
  it("空条件では全シーンを返す", () => {
    expect(filterScenes(scenes, "", [])).toHaveLength(scenes.length);
  });

  it("クエリはシーン名の部分一致（大小文字を区別しない）", () => {
    const result = filterScenes(scenes, "ポートレート", []);
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("portrait");
  });

  it("クエリは一行解説にも部分一致する", () => {
    const result = filterScenes(scenes, "シルク", []);
    expect(result.map((scene) => scene.id)).toContain("waterfall");
  });

  it("選択したタグをすべて持つシーンのみ返す（AND条件）", () => {
    const result = filterScenes(scenes, "", ["low-light", "handheld"]);
    for (const scene of result) {
      expect(scene.tags).toContain("low-light");
      expect(scene.tags).toContain("handheld");
    }
    expect(result.map((scene) => scene.id)).toEqual(["indoor-event"]);
    expect(filterScenes(scenes, "", ["low-light"]).map((s) => s.id)).toContain("night-star");
  });

  it("クエリとタグの両方で絞り込める", () => {
    expect(filterScenes(scenes, "ポートレート", ["tripod"])).toHaveLength(0);
  });
});

describe("collectTagIds", () => {
  it("シーン一覧から重複のないタグIDを抽出する", () => {
    const ids = collectTagIds(scenes);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain("bokeh");
  });
});
