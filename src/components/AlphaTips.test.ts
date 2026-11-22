/** alphaTips.json のデータ整合性テスト */

import { describe, expect, it } from "vitest";
import alphaTips from "../data/alphaTips.json";
import type { GlossaryData } from "../types";

const data = alphaTips as GlossaryData;

describe("alphaTips.json データ整合性", () => {
  it("グループと項目が定義されている", () => {
    expect(data.groups.length).toBeGreaterThan(0);
    const total = data.groups.reduce((sum, group) => sum + group.entries.length, 0);
    expect(total).toBeGreaterThanOrEqual(10);
  });

  it("項目IDは全体で重複しない", () => {
    const ids = data.groups.flatMap((group) => group.entries.map((entry) => entry.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("用語と本文が空でない", () => {
    for (const entry of data.groups.flatMap((group) => group.entries)) {
      expect(entry.term.trim().length).toBeGreaterThan(0);
      expect(entry.body.trim().length).toBeGreaterThan(0);
    }
  });

  it("glossary.json ともIDが衝突しない", async () => {
    const glossary = (await import("../data/glossary.json")).default as GlossaryData;
    const glossaryIds = new Set(
      glossary.groups.flatMap((group) => group.entries.map((entry) => entry.id))
    );
    for (const entry of data.groups.flatMap((group) => group.entries)) {
      expect(glossaryIds.has(entry.id), `ID "${entry.id}" が glossary と重複`).toBe(false);
    }
  });
});
