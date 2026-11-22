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
  /** あるある失敗と対策（1行） */
  failure: string;
  /** 解説・注意点 */
  tips: string[];
  /** 目的・悩みタグ */
  tags: TagId[];
}

/** cameraSettings.json のルート構造 */
export interface CameraSettingsData {
  scenes: Scene[];
}

/** 用語集の1項目 */
export interface GlossaryEntry {
  /** 一意ID */
  id: string;
  /** 用語名 */
  term: string;
  /** 解説本文 */
  body: string;
}

/** 用語集のグループ（露出の基礎・カメラ側設定など） */
export interface GlossaryGroup {
  /** 一意ID */
  id: string;
  /** グループ見出し */
  heading: string;
  /** 用語一覧 */
  entries: GlossaryEntry[];
}

/** glossary.json のルート構造 */
export interface GlossaryData {
  groups: GlossaryGroup[];
}
