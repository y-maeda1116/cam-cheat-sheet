/** アプリ全体で共通の定数・タグカタログ */

import type { TagId } from "../types";

/** 目的・悩みタグの定義 */
export interface TagDef {
  id: TagId;
  label: string;
}

export const TAG_DEFS: readonly TagDef[] = [
  { id: "bokeh", label: "ボケを活かす" },
  { id: "pan-focus", label: "パンフォーカス" },
  { id: "capture-motion", label: "動きを捉える" },
  { id: "anti-shake", label: "手ブレ防止" },
  { id: "low-light", label: "暗い場所" },
  { id: "low-noise", label: "ノイズ低減" },
  { id: "handheld", label: "手持ちOK" },
  { id: "tripod", label: "三脚推奨" },
  { id: "daylight", label: "日中" },
] as const;

/** タグIDからラベルを引く（未定義IDはID自身を返す） */
export function tagLabel(id: TagId): string {
  return TAG_DEFS.find((tag) => tag.id === id)?.label ?? id;
}

/** アプリのタイトル */
export const APP_TITLE = "カメラ設定チートシート";

/** アプリのキャッチコピー */
export const APP_TAGLINE = "シーン別の推奨設定と露出の3要素を、撮影前にサッと確認";
