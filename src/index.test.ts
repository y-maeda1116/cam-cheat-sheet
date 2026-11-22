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

  it("すべてのシーンに失敗例（failure）が1行定義されている", () => {
    for (const scene of data.scenes) {
      expect(typeof scene.failure).toBe("string");
      expect(scene.failure.trim().length).toBeGreaterThan(0);
    }
  });

  it("シーン数は8以上あり、シーンごとに3要素が設定されている", () => {
    expect(data.scenes.length).toBeGreaterThanOrEqual(8);
    for (const scene of data.scenes) {
      expect(scene.tags.length).toBeGreaterThan(0);
    }
  });
});

describe("アイコン登録表", () => {
  it("すべてのシーンアイコンが ICON_REGISTRY に存在する", async () => {
    const { ICON_REGISTRY } = await import("./components/icon");
    for (const scene of data.scenes) {
      expect(ICON_REGISTRY[scene.icon], `scene ${scene.id} の icon "${scene.icon}"`).toBeDefined();
    }
  });
});
