/** サイトヘッダーコンポーネント */

import { APP_TAGLINE, APP_TITLE } from "../config";
import { el } from "./dom";

/** タイトルとキャッチコピーを含むヘッダーを生成する */
export function createHeader(): HTMLElement {
  const header = el("header", "border-b border-line pb-8");
  const title = el(
    "h1",
    "font-mono text-2xl font-semibold tracking-tight text-ink sm:text-3xl",
    APP_TITLE
  );
  const tagline = el("p", "mt-3 text-sm leading-relaxed text-dim", APP_TAGLINE);
  header.append(title, tagline);
  return header;
}
