/** DOM 要素生成の共通ヘルパー（innerHTML 不使用方針の基礎） */

/**
 * 要素を生成する。
 * @param tag - タグ名
 * @param className - クラス名（省略可）
 * @param text - テキスト内容（省略可。textContent で安全に設定する）
 */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text = "",
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className !== "") node.className = className;
  if (text !== "") node.textContent = text;
  return node;
}
