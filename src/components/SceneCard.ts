/** シーンカードコンポーネント */

import { tagLabel } from "../config";
import { formatShutter } from "../lib/exposure";
import type { Scene } from "../types";
import { el } from "./dom";
import { iconEl } from "./icon";

export interface SceneCardOptions {
  /** 「シミュレーターで試す」がクリックされたときに呼ばれる */
  onSimulate?: (scene: Scene) => void;
}

/** シーン1件分の推奨設定カードを生成する */
export function createSceneCard(scene: Scene, options: SceneCardOptions = {}): HTMLElement {
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

  const failureNote = el(
    "p",
    "flex items-start gap-2 rounded-lg border border-warn/40 bg-warn/10 p-2.5 text-sm leading-relaxed text-ink"
  );
  failureNote.append(iconEl("triangle-alert", "size-4 shrink-0 text-warn"));
  failureNote.append(el("span", undefined, scene.failure));

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

  const footer = el("div", "flex justify-end");
  if (options.onSimulate !== undefined) {
    const simulate = el("button", "reset-button", "シミュレーターで試す");
    simulate.type = "button";
    simulate.setAttribute("aria-label", `${scene.name}の推奨設定をシミュレーターで試す`);
    simulate.addEventListener("click", () => {
      options.onSimulate?.(scene);
    });
    footer.append(simulate);
  }

  card.append(head, settings, summary, failureNote, tips, tags, footer);
  return card;
}
