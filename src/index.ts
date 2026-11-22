/** Vite エントリポイント: ページを組み立て、検索・タグ絞り込みを配線する */

import "./style.css";
import alphaTips from "./data/alphaTips.json";
import cameraSettings from "./data/cameraSettings.json";
import glossary from "./data/glossary.json";
import { createExposureSimulator } from "./components/ExposureSimulator";
import { createGlossary } from "./components/Glossary";
import { createHeader } from "./components/Header";
import { createSceneCard } from "./components/SceneCard";
import { createTagFilter } from "./components/TagFilter";
import { el } from "./components/dom";
import { filterScenes } from "./lib/filter";
import { decodeAppState, encodeAppState } from "./lib/urlState";
import type { SimulatorValues } from "./lib/urlState";
import type { CameraSettingsData, GlossaryData, Scene } from "./types";

const data = cameraSettings as CameraSettingsData;
const terms = glossary as GlossaryData;
const tips = alphaTips as GlossaryData;

const EMPTY_MESSAGE = "一致するシーンがありません。検索条件を変えてみてください。";

function renderGrid(
  grid: HTMLElement,
  empty: HTMLElement,
  scenes: Scene[],
  onSimulate: (scene: Scene) => void
): void {
  grid.replaceChildren(...scenes.map((scene) => createSceneCard(scene, { onSimulate })));
  empty.hidden = scenes.length > 0;
}

function mount(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (app === null) throw new Error("#app が見つかりません");

  const initial = decodeAppState(window.location.search);

  let currentQuery = initial.filter.query;
  let currentTags: string[] = [...initial.filter.tags];
  let currentSim: SimulatorValues | null = initial.simulator;

  /** 検索・タグ・シミュレーターの状態をURLへ反映する（共有・ブックマーク用） */
  const syncUrl = (): void => {
    const encoded = encodeAppState({ query: currentQuery, tags: currentTags }, currentSim);
    const next = `${window.location.pathname}${encoded === "" ? "" : `?${encoded}`}`;
    window.history.replaceState(null, "", next);
  };

  const main = el("main", "mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10");

  main.append(createHeader());
  const simulator = createExposureSimulator({
    initial: initial.simulator ?? undefined,
    onChange: (values) => {
      currentSim = values;
      syncUrl();
    },
  });
  main.append(simulator.root);

  /** シーンの推奨設定をシミュレーターへ読み込み、見える位置へスクロールする */
  const loadIntoSimulator = (scene: Scene): void => {
    simulator.setValues({
      aperture: scene.aperture,
      shutterSec: scene.shutterSec,
      iso: scene.iso,
    });
    simulator.root.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sheetHead = el("div", "flex flex-col gap-1");
  sheetHead.append(
    el("h2", "text-lg font-bold text-ink", "シーン別チートシート"),
    el("p", "text-sm text-dim", "目的のタグを選ぶと、条件をすべて満たすシーンに絞り込めます")
  );

  const grid = el("div", "grid gap-5 sm:grid-cols-2");
  const empty = el("p", "text-sm text-dim", EMPTY_MESSAGE);
  empty.hidden = true;

  main.append(sheetHead);
  main.append(
    createTagFilter({
      initial: { query: currentQuery, tags: currentTags },
      onFilterChange: (query, tags) => {
        currentQuery = query;
        currentTags = [...tags];
        renderGrid(grid, empty, filterScenes(data.scenes, query, tags), loadIntoSimulator);
        syncUrl();
      },
    })
  );
  main.append(grid, empty);
  main.append(createGlossary(terms.groups));
  main.append(
    createGlossary(tips.groups, {
      title: "α7 III 系ショートカット・便利技",
      subtitle:
        "α7 III / α7R III / α7S III 想定の操作ガイド。項目名や初期割り当てはファームウェアで多少異なることがあります",
      ariaLabel: "α7 III 系ショートカット・便利技",
    })
  );

  app.replaceChildren(main);
  renderGrid(grid, empty, filterScenes(data.scenes, currentQuery, currentTags), loadIntoSimulator);

  // PWA: 撮影現場など圏外でも開けるようサービスワーカーを登録する
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      void navigator.serviceWorker.register("./sw.js").catch(() => {
        /* 登録失敗はオフライン機能が無効になるだけでアプリは動作する */
      });
    });
  }
}

mount();
