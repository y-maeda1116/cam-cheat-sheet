// @vitest-environment happy-dom
/** 用語集コンポーネントと glossary.json のテスト */

import { beforeEach, describe, expect, it } from "vitest";
import glossary from "../data/glossary.json";
import type { GlossaryData } from "../types";
import { createGlossary } from "./Glossary";

const data = glossary as GlossaryData;

describe("glossary.json データ整合性", () => {
  it("グループと用語が1件以上定義されている", () => {
    expect(data.groups.length).toBeGreaterThan(0);
    for (const group of data.groups) {
      expect(group.heading.trim().length).toBeGreaterThan(0);
      expect(group.entries.length).toBeGreaterThan(0);
    }
  });

  it("用語IDは全体で重複しない", () => {
    const ids = data.groups.flatMap((group) => group.entries.map((entry) => entry.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("用語と本文が空でない", () => {
    for (const entry of data.groups.flatMap((group) => group.entries)) {
      expect(entry.term.trim().length).toBeGreaterThan(0);
      expect(entry.body.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("createGlossary", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it("グループ見出しと全用語を details/summary で描画する", () => {
    const section = createGlossary(data.groups);
    document.body.append(section);

    const headings = [...section.querySelectorAll("h3")].map((h) => h.textContent);
    expect(headings).toEqual(data.groups.map((group) => group.heading));

    const total = data.groups.reduce((sum, group) => sum + group.entries.length, 0);
    expect(section.querySelectorAll("details")).toHaveLength(total);
    expect(section.querySelectorAll("details > summary")).toHaveLength(total);
  });

  it("用語は初期状態で閉じている（開くと本文が現れる）", () => {
    const entry = data.groups[0]!.entries[0]!;
    const section = createGlossary(data.groups);
    document.body.append(section);

    const details = section.querySelector<HTMLDetailsElement>("details");
    expect(details?.open).toBeFalsy();
    expect(details?.textContent).toContain(entry.body);
  });
});

describe("createGlossary: カスタム見出し", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it("options でタイトル・説明・aria-label を差し替えられる", () => {
    const section = createGlossary(data.groups, {
      title: "α7 III 系ショートカット・便利技",
      subtitle: "操作ガイド",
      ariaLabel: "αショートカット",
    });
    document.body.append(section);

    const h2 = section.querySelector("h2");
    expect(h2?.textContent).toBe("α7 III 系ショートカット・便利技");
    expect(section.textContent).toContain("操作ガイド");
    expect(section.getAttribute("aria-label")).toBe("αショートカット");
  });
});
