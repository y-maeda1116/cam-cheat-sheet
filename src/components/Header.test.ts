// @vitest-environment happy-dom
/** ヘッダーコンポーネントのテスト(DOM 操作のため happy-dom 環境で実行) */

import { beforeEach, describe, expect, it } from "vitest";
import { APP_TAGLINE, APP_TITLE } from "../config";
import { createHeader } from "./Header";

describe("createHeader", () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it("タイトルとキャッチコピーを表示する", () => {
    const header = createHeader();
    document.body.append(header);

    const h1 = header.querySelector("h1");
    expect(h1?.textContent).toBe(APP_TITLE);
    expect(header.textContent).toContain(APP_TAGLINE);
  });

  it("タイトルは h1 として一度だけ現れる", () => {
    const header = createHeader();
    document.body.append(header);

    expect(document.querySelectorAll("h1")).toHaveLength(1);
  });
});
