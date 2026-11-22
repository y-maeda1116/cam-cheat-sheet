/** 用語集コンポーネント（details/summary のネイティブアコーディオン） */

import type { GlossaryGroup } from "../types";
import { el } from "./dom";

/**
 * 用語集セクションを生成する。
 * 各用語は <details>/<summary> で開閉し、JavaScript なしで動作する。
 */
export function createGlossary(groups: readonly GlossaryGroup[]): HTMLElement {
  const section = el("section", "flex flex-col gap-6");
  section.setAttribute("aria-label", "用語集");

  section.append(
    el("h2", "text-lg font-bold text-ink", "用語ミニ辞書"),
    el("p", "text-sm text-dim", "露出の基礎と、シーン解説で触れるカメラ側の設定をまとめました")
  );

  for (const group of groups) {
    const block = el("div", "flex flex-col gap-3");
    block.append(el("h3", "text-sm font-semibold text-lcd", group.heading));

    for (const entry of group.entries) {
      const item = el(
        "details",
        "rounded-lg border border-line bg-panel px-4 py-3 text-sm leading-relaxed"
      );
      const summary = el("summary", "cursor-pointer font-semibold text-ink", entry.term);
      summary.setAttribute("aria-keyshortcuts", "none");
      item.append(summary, el("p", "mt-2 text-dim", entry.body));
      block.append(item);
    }

    section.append(block);
  }

  return section;
}
