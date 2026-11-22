/** URL状態のエンコード・デコード（純粋関数）のユニットテスト */

import { describe, expect, it } from "vitest";
import { decodeAppState, encodeAppState } from "./urlState";

describe("encodeAppState", () => {
  it("空の状態では空文字列を返す", () => {
    expect(encodeAppState({ query: "", tags: [] }, null)).toBe("");
  });

  it("検索語とタグをクエリ文字列にエンコードする", () => {
    const encoded = encodeAppState({ query: "ポートレート", tags: ["bokeh", "handheld"] }, null);
    expect(encoded).toBe(
      "q=%E3%83%9D%E3%83%BC%E3%83%88%E3%83%AC%E3%83%BC%E3%83%88&tags=bokeh%2Chandheld"
    );
  });

  it("シミュレーター状態はカンマ区切りでエンコードする", () => {
    const encoded = encodeAppState(
      { query: "", tags: [] },
      {
        aperture: 2.8,
        shutterSec: 0.008,
        iso: 400,
      }
    );
    expect(encoded).toBe("sim=2.8%2C0.008%2C400");
  });

  it("検索語・タグ・シミュレーターを同時にエンコードする", () => {
    const encoded = encodeAppState(
      { query: "花火", tags: ["tripod"] },
      {
        aperture: 8,
        shutterSec: 4,
        iso: 100,
      }
    );
    expect(encoded).toContain("q=%E8%8A%B1%E7%81%AB");
    expect(encoded).toContain("tags=tripod");
    expect(encoded).toContain("sim=8%2C4%2C100");
  });
});

describe("decodeAppState", () => {
  it("空文字列からは空の状態を返す", () => {
    const decoded = decodeAppState("");
    expect(decoded.filter.query).toBe("");
    expect(decoded.filter.tags).toEqual([]);
    expect(decoded.simulator).toBeNull();
  });

  it("エンコード結果を復元できる（ラウンドトリップ）", () => {
    const filter = { query: "ポートレート", tags: ["bokeh", "handheld"] };
    const sim = { aperture: 8, shutterSec: 4, iso: 100 };
    const decoded = decodeAppState(encodeAppState(filter, sim));
    expect(decoded.filter).toEqual(filter);
    expect(decoded.simulator).toEqual(sim);
  });

  it("未知のタグは無視する", () => {
    const decoded = decodeAppState("?tags=bokeh,unknown-tag");
    expect(decoded.filter.tags).toEqual(["bokeh"]);
  });

  it("シミュレーター値は最も近いステップに丸められる", () => {
    const decoded = decodeAppState("sim=3,0.009,500");
    // f/3 → f/2.8、1/111秒相当 → 1/125秒、ISO 500 → ISO 400
    expect(decoded.simulator).toEqual({ aperture: 2.8, shutterSec: 0.008, iso: 400 });
  });

  it("不正なシミュレーター値（0・負・非数値）は無視される", () => {
    expect(decodeAppState("sim=0,4,100").simulator).toBeNull();
    expect(decodeAppState("sim=8,abc,100").simulator).toBeNull();
    expect(decodeAppState("sim=8,4").simulator).toBeNull();
  });

  it("先頭の ? がなくてもパースできる", () => {
    const decoded = decodeAppState("q=%E8%8A%B1%E7%81%AB&tags=tripod");
    expect(decoded.filter.query).toBe("花火");
    expect(decoded.filter.tags).toEqual(["tripod"]);
  });
});

describe("ND フィルターを含む sim のエンコード・復元", () => {
  it("ND ありのシミュレーター状態をラウンドトリップできる", () => {
    const sim = { aperture: 11, shutterSec: 1, iso: 100, nd: 3 };
    const decoded = decodeAppState(encodeAppState({ query: "", tags: [] }, sim));
    expect(decoded.simulator).toEqual(sim);
  });

  it("ND 値は最も近いステップ（0/3/6/10）に丸められる", () => {
    const decoded = decodeAppState("sim=11,1,100,4");
    expect(decoded.simulator?.nd).toBe(3);
  });

  it("3項目のみの従来形式も引き続き受け付ける", () => {
    const decoded = decodeAppState("sim=2.8,0.008,400");
    expect(decoded.simulator).toEqual({ aperture: 2.8, shutterSec: 0.008, iso: 400 });
  });

  it("5項目以上は不正として無視される", () => {
    expect(decodeAppState("sim=2.8,0.008,400,3,9").simulator).toBeNull();
  });
});
