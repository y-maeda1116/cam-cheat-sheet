/** シーンデータ（cameraSettings.json）の整合性テスト */

import { describe, expect, it } from "vitest";
import { TAG_DEFS } from "./config";
import cameraSettings from "./data/cameraSettings.json";
import type { CameraSettingsData } from "./types";

const data = cameraSettings as CameraSettingsData;
const knownTagIds = new Set(TAG_DEFS.map((tag) => tag.id));

describe("cameraSettings.json", () => {
  it("シーンが1件以上定義されている", () => {
    expect(data.scenes.length).toBeGreaterThan(0);
  });

  it("シーンIDは重複しない", () => {
    const ids = data.scenes.map((scene) => scene.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("すべてのタグIDは TAG_DEFS に定義されている", () => {
    for (const scene of data.scenes) {
      for (const tag of scene.tags) {
        expect(knownTagIds.has(tag)).toBe(true);
      }
    }
  });

  it("露出の3要素は正の数で、tips が空でない", () => {
    for (const scene of data.scenes) {
      expect(scene.aperture).toBeGreaterThan(0);
      expect(scene.shutterSec).toBeGreaterThan(0);
      expect(scene.iso).toBeGreaterThan(0);
      expect(scene.tips.length).toBeGreaterThan(0);
    }
  });
});
