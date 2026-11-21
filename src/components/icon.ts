/** Lucide アイコン要素の生成ヘルパー（使用アイコンのみ名前指定で取り込む） */

import {
  Building2,
  Fish,
  Flower2,
  Leaf,
  Lightbulb,
  MoonStar,
  Mountain,
  Music,
  PawPrint,
  Plane,
  Snowflake,
  Sparkles,
  Sunset,
  TrainFront,
  TriangleAlert,
  UserRound,
  Waves,
  Zap,
} from "lucide";
import type { IconNode } from "lucide";

/** シーン・UI で使用するアイコンの登録表（data/cameraSettings.json の icon と対応） */
export const ICON_REGISTRY: Record<string, IconNode> = {
  "building-2": Building2,
  fish: Fish,
  "flower-2": Flower2,
  leaf: Leaf,
  lightbulb: Lightbulb,
  "moon-star": MoonStar,
  mountain: Mountain,
  music: Music,
  "paw-print": PawPrint,
  plane: Plane,
  snowflake: Snowflake,
  sparkles: Sparkles,
  sunset: Sunset,
  "train-front": TrainFront,
  "triangle-alert": TriangleAlert,
  "user-round": UserRound,
  waves: Waves,
  zap: Zap,
};

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Lucide アイコンを含む要素を生成する。
 * 登録表にない名前は triangle-alert にフォールバックする。
 */
export function iconEl(name: string, cssClass: string): HTMLElement {
  const node = ICON_REGISTRY[name] ?? TriangleAlert;

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  if (cssClass !== "") svg.setAttribute("class", cssClass);

  for (const [tag, attrs] of node) {
    const child = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
      child.setAttribute(key, String(value));
    }
    svg.append(child);
  }

  const wrapper = document.createElement("span");
  wrapper.className = "lucide-icon";
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.append(svg);
  return wrapper;
}
