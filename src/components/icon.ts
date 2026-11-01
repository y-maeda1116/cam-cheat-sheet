/** Lucide アイコン要素の生成ヘルパー */

import { createIcons, icons } from "lucide";

/**
 * Lucide アイコンを含む要素を生成する。
 * createIcons は root の子孫しか走査しないため、
 * `<i data-lucide>` を一時ラッパーに入れてから置換し、ラッパーごと返す。
 */
export function iconEl(name: string, cssClass: string): HTMLElement {
  const wrapper = document.createElement("span");
  wrapper.className = `lucide-icon ${cssClass}`;
  wrapper.setAttribute("aria-hidden", "true");

  const icon = document.createElement("i");
  icon.setAttribute("data-lucide", name);
  wrapper.append(icon);

  createIcons({ icons, root: wrapper });
  return wrapper;
}
