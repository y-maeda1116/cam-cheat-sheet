/** Vite エントリポイント: ページを組み立て、検索・タグ絞り込みを配線する */

import "./style.css";
import cameraSettings from "./data/cameraSettings.json";
import { createExposureSimulator } from "./components/ExposureSimulator";
import { createHeader } from "./components/Header";
import { createSceneCard } from "./components/SceneCard";
import { createTagFilter } from "./components/TagFilter";
import { el } from "./components/dom";
import { filterScenes } from "./lib/filter";
import { decodeAppState, encodeAppState } from "./lib/urlState";
import type { SimulatorValues } from "./lib/urlState";
import type { CameraSettingsData, Scene } from "./types";

const data = cameraSettings as CameraSettingsData;

const EMPTY_MESSAGE = "一致するシーンがありません。検索条件を変えてみてください。";

function renderGrid(grid: HTMLElement, empty: HTMLElement, scenes: Scene[]): void {
  grid.replaceChildren(...scenes.map(createSceneCard));
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
  main.append(
    createExposureSimulator({
      initial: initial.simulator ?? undefined,
      onChange: (values) => {
        currentSim = values;
        syncUrl();
      },
    })
  );

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
        renderGrid(grid, empty, filterScenes(data.scenes, query, tags));
        syncUrl();
      },
    })
  );
  main.append(grid, empty);

  app.replaceChildren(main);
  renderGrid(grid, empty, filterScenes(data.scenes, currentQuery, currentTags));

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
