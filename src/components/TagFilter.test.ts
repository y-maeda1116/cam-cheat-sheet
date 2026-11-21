// @vitest-environment happy-dom
/** 検索・タグフィルターのテスト(DOM 操作のため happy-dom 環境で実行) */

import { beforeEach, describe, expect, it } from "vitest";
import { TAG_DEFS } from "../config";
import { createTagFilter } from "./TagFilter";

interface Call {
  query: string;
  tags: string[];
}

function setup(initial?: { query: string; tags: string[] }) {
  const calls: Call[] = [];
  const root = createTagFilter({
    initial,
    onFilterChange: (query, tags) => {
      calls.push({ query, tags: [...tags] });
    },
  });
  document.body.replaceChildren(root);
  const search = root.querySelector<HTMLInputElement>("input[type=search]");
  if (search === null) throw new Error("search input not found");
  return { root, search, calls };
}

function chip(root: HTMLElement, label: string): HTMLButtonElement {
  const btn = [...root.querySelectorAll("button")].find((b) => b.textContent === label);
  if (!(btn instanceof HTMLButtonElement)) throw new Error(`chip not found: ${label}`);
  return btn;
}

describe("createTagFilter", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it("検索入力のたびにクエリがコールバックへ流れる", () => {
    const { search, calls } = setup();

    search.value = "ポートレート";
    search.dispatchEvent(new Event("input"));

    expect(calls.at(-1)?.query).toBe("ポートレート");
    expect(calls.at(-1)?.tags).toEqual([]);
  });

  it("タグチップはクリックで選択・再クリックで解除（AND条件を通知）", () => {
    const first = TAG_DEFS[0]!;
    const second = TAG_DEFS[1]!;
    const { root, calls } = setup();

    const chip1 = chip(root, first.label);
    chip1.click();
    expect(calls.at(-1)?.tags).toEqual([first.id]);
    expect(chip1.getAttribute("aria-pressed")).toBe("true");

    const chip2 = chip(root, second.label);
    chip2.click();
    expect(calls.at(-1)?.tags).toEqual([first.id, second.id]);

    chip1.click();
    expect(calls.at(-1)?.tags).toEqual([second.id]);
    expect(chip1.getAttribute("aria-pressed")).toBe("false");
  });

  it("初期状態を与えると検索語とタグ選択が復元される", () => {
    const first = TAG_DEFS[0]!;
    const { root, search, calls } = setup({ query: "花火", tags: [first.id] });

    expect(search.value).toBe("花火");
    const chip1 = chip(root, first.label);
    expect(chip1.getAttribute("aria-pressed")).toBe("true");

    // 復元だけでは通知されず、次の操作で現在の全選択が流れる
    chip1.click();
    expect(calls).toHaveLength(1);
    expect(calls[0]?.tags).toEqual([]);
  });
});
