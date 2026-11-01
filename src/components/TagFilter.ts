/** シーン検索・タグ絞り込み UI コンポーネント */

import { TAG_DEFS } from "../config";
import type { TagId } from "../types";
import { el } from "./dom";

export interface TagFilterOptions {
  /** 検索条件が変わったときに呼ばれる */
  onFilterChange: (query: string, tags: TagId[]) => void;
}

/**
 * 検索入力とタグチップを備えたフィルターを生成する。
 * タグは AND 条件で絞り込む（aria-pressed で選択状態を表す）。
 */
export function createTagFilter(options: TagFilterOptions): HTMLElement {
  let query = "";
  const selected = new Set<TagId>();

  const notify = (): void => {
    options.onFilterChange(query, [...selected]);
  };

  const search = el("input", "search-input");
  search.type = "search";
  search.placeholder = "シーン名で検索（例: ポートレート）";
  search.setAttribute("aria-label", "シーン検索");
  search.addEventListener("input", () => {
    query = search.value;
    notify();
  });

  const chips = el("div", "flex flex-wrap gap-2");
  for (const tag of TAG_DEFS) {
    const chip = el("button", "tag-chip", tag.label);
    chip.type = "button";
    chip.dataset.active = "false";
    chip.setAttribute("aria-pressed", "false");
    chip.addEventListener("click", () => {
      if (selected.has(tag.id)) {
        selected.delete(tag.id);
        chip.dataset.active = "false";
      } else {
        selected.add(tag.id);
        chip.dataset.active = "true";
      }
      chip.setAttribute("aria-pressed", selected.has(tag.id) ? "true" : "false");
      notify();
    });
    chips.append(chip);
  }

  const root = el("div", "flex flex-col gap-4");
  root.append(search, chips);
  return root;
}
