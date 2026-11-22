import { expect, test } from "@playwright/test";

test.describe("初期表示", () => {
  test("ヘッダー・全シーンカード・用語集が描画される", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("カメラ設定チートシート");
    await expect(page.getByRole("article")).toHaveCount(17);
    await expect(page.getByRole("heading", { name: "用語ミニ辞書" })).toBeVisible();
    await expect(page.locator("section[aria-label='用語集'] details")).toHaveCount(12);
    await expect(
      page.getByRole("heading", { name: "α7 III 系ショートカット・便利技" })
    ).toBeVisible();
    await expect(
      page.locator("section[aria-label='α7 III 系ショートカット・便利技'] details")
    ).toHaveCount(13);
  });

  test("サービスワーカーが登録される", async ({ page }) => {
    await page.goto("/");
    const registered = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return false;
      const reg = await navigator.serviceWorker.ready;
      return reg !== null;
    });
    expect(registered).toBe(true);
  });
});

test.describe("検索・タグ絞り込み", () => {
  test("検索語でシーンが絞り込まれる", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("シーン検索").fill("ポートレート");

    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByRole("article").first()).toContainText("ポートレート");
  });

  test("一致がないとき空メッセージが出る", async ({ page }) => {
    await page.goto("/");

    await page.getByLabel("シーン検索").fill("存在しないシーン");

    await expect(page.getByText("一致するシーンがありません")).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);
  });

  test("タグはAND条件で絞り込む", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "暗い場所" }).click();
    await page.getByRole("button", { name: "三脚推奨" }).click();

    const cards = page.getByRole("article");
    // 低照度かつ三脚前提のシーン: 夜景・星空 / 花火 / イルミネーション
    await expect(cards).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i)).toContainText("三脚推奨");
    }
  });
});

test.describe("露出シミュレーター", () => {
  test("ダイヤル操作で露出オフセットが変化する", async ({ page }) => {
    await page.goto("/");

    const ev = page.locator("section[aria-label='露出シミュレーター'] p.font-mono.text-lg");
    await expect(ev).toHaveText("+0.0 EV");

    await page.getByRole("button", { name: "F値を明るくする" }).click();

    await expect(ev).not.toHaveText("+0.0 EV");
  });

  test("適正化提案が表示される", async ({ page }) => {
    await page.goto("/");

    // f/2.8 → f/22（6ステップ）まで絞って大幅アンダーにする
    for (let i = 0; i < 6; i++) {
      await page.getByRole("button", { name: "F値を明るくする" }).click();
    }

    await expect(page.getByText(/適正へ寄せる例/)).toBeVisible();
  });

  test("NDフィルターでオフセットがアンダー方向へ動く", async ({ page }) => {
    await page.goto("/");

    const ev = page.locator("section[aria-label='露出シミュレーター'] p.font-mono.text-lg");
    await expect(ev).toHaveText("+0.0 EV");

    await page.getByRole("button", { name: "NDフィルターを明るくする" }).click();

    await expect(ev).toHaveText("+3.0 EV");
  });
});

test.describe("シーン → シミュレーター連携とURL共有", () => {
  test("「シミュレーターで試す」で推奨設定が読み込まれる", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("button", { name: "ポートレートの推奨設定をシミュレーターで試す" })
      .click();

    await expect(
      page.locator("section[aria-label='露出シミュレーター'] p.font-mono.text-xl")
    ).toHaveText(["f/1.8", "1/250", "ISO 200", "なし"]);
  });

  test("操作内容がURLに反映され、再訪で復元される", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "三脚推奨" }).click();
    await expect(page).toHaveURL(/tags=tripod/);

    await page.reload();
    await expect(page.getByRole("article").first()).toContainText("夜景・星空");
    await expect(page.getByRole("button", { name: "三脚推奨" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
