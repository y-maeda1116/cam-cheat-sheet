/** シーン別カメラ設定の型定義 */

/** タグID（src/config/index.ts の TAG_DEFS に対応） */
export type TagId = string;

/** 撮影シーン1件分の推奨設定 */
export interface Scene {
  /** 一意ID */
  id: string;
  /** シーン名（日本語） */
  name: string;
  /** Lucide アイコン名（kebab-case） */
  icon: string;
  /** 推奨F値 */
  aperture: number;
  /** 推奨シャッタースピード（秒） */
  shutterSec: number;
  /** 推奨ISO感度 */
  iso: number;
  /** 一行解説 */
  summary: string;
  /** 解説・注意点 */
  tips: string[];
  /** 目的・悩みタグ */
  tags: TagId[];
}

/** cameraSettings.json のルート構造 */
export interface CameraSettingsData {
  scenes: Scene[];
}
