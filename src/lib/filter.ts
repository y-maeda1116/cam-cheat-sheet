/** シーン検索・タグ絞り込みのロジック（純粋関数） */

import type { Scene, TagId } from "../types";

/**
 * クエリ文字列とタグ選択でシーンを絞り込む。
 * - クエリ: シーン名・一行解説の部分一致（大小文字を区別しない）
 * - タグ  : 選択したタグをすべて持つシーンのみ（AND条件）
 */
export function filterScenes(
  scenes: readonly Scene[],
  query: string,
  selectedTags: readonly TagId[]
): Scene[] {
  const normalizedQuery = query.trim().toLowerCase();
  return scenes.filter((scene) => {
    const matchesQuery =
      normalizedQuery === "" ||
      scene.name.toLowerCase().includes(normalizedQuery) ||
      scene.summary.toLowerCase().includes(normalizedQuery);
    const matchesTags = selectedTags.every((tag) => scene.tags.includes(tag));
    return matchesQuery && matchesTags;
  });
}

/** シーン一覧から重複のないタグID一覧を抽出 */
export function collectTagIds(scenes: readonly Scene[]): TagId[] {
  return [...new Set(scenes.flatMap((scene) => scene.tags))];
}
