/** シーンカードコンポーネント */

import { tagLabel } from "../config";
import { formatShutter } from "../lib/exposure";
import type { Scene } from "../types";
import { el } from "./dom";
import { iconEl } from "./icon";

/** シーン1件分の推奨設定カードを生成する */
export function createSceneCard(scene: Scene): HTMLElement {
  const card = el("article", "rounded-xl border border-line bg-panel p-5 flex flex-col gap-4");
  card.setAttribute("aria-label", `${scene.name}の推奨設定`);

  const head = el("div", "flex items-center gap-3");
  head.append(iconEl(scene.icon, "text-lcd"));
  const name = el("h3", "text-base font-bold text-ink", scene.name);
  head.append(name);

  const settings = el("dl", "grid grid-cols-3 gap-3");
  const values: readonly [string, string][] = [
    ["F値", `f/${scene.aperture}`],
    ["シャッター", formatShutter(scene.shutterSec)],
    ["ISO", `ISO ${scene.iso}`],
  ];
  for (const [term, value] of values) {
    const cell = el("div");
    cell.append(el("dt", "text-[10px] tracking-wide text-dim", term));
    cell.append(el("dd", "font-mono text-sm font-semibold text-lcd", value));
    settings.append(cell);
  }

  const summary = el("p", "text-sm leading-relaxed text-dim", scene.summary);

  const tips = el("ul", "flex flex-col gap-1.5 text-sm leading-relaxed text-ink");
  for (const tip of scene.tips) {
    const item = el("li", "flex gap-2");
    const marker = el("span", "text-lcd", "–");
    marker.setAttribute("aria-hidden", "true");
    item.append(marker, el("span", undefined, tip));
    tips.append(item);
  }

  const tags = el("div", "flex flex-wrap gap-1.5");
  for (const id of scene.tags) {
    tags.append(el("span", "tag-badge", tagLabel(id)));
  }

  card.append(head, settings, summary, tips, tags);
  return card;
}
