/** アプリ状態のURLクエリ文字列へのエンコード・復元（純粋関数） */

import { TAG_DEFS } from "../config";
import type { TagId } from "../types";
import { APERTURE_STEPS, ISO_STEPS, SHUTTER_STEPS, nearestStepIndex } from "./exposure";

/** 検索・タグ絞り込みの状態 */
export interface FilterState {
  query: string;
  tags: TagId[];
}

/** シミュレーターのダイヤル値 */
export interface SimulatorValues {
  aperture: number;
  shutterSec: number;
  iso: number;
}

/** URLに保存するアプリ状態 */
export interface AppState {
  filter: FilterState;
  simulator: SimulatorValues | null;
}

const knownTagIds = new Set<string>(TAG_DEFS.map((tag) => tag.id));

/** 有効なダイヤル値（ステップ配列の範囲内）に変換できた場合のみ返す */
function normalizeSimulator(raw: string): SimulatorValues | null {
  const parts = raw.split(",");
  if (parts.length !== 3) return null;
  const [apertureRaw, shutterRaw, isoRaw] = parts;
  const aperture = Number(apertureRaw);
  const shutterSec = Number(shutterRaw);
  const iso = Number(isoRaw);
  if (![aperture, shutterSec, iso].every((value) => Number.isFinite(value) && value > 0)) {
    return null;
  }
  return {
    aperture: APERTURE_STEPS[nearestStepIndex(APERTURE_STEPS, aperture)]!,
    shutterSec: SHUTTER_STEPS[nearestStepIndex(SHUTTER_STEPS, shutterSec)]!,
    iso: ISO_STEPS[nearestStepIndex(ISO_STEPS, iso)]!,
  };
}

/** アプリ状態をクエリ文字列（? を含まない）にエンコードする。空の項目は省略する */
export function encodeAppState(filter: FilterState, simulator: SimulatorValues | null): string {
  const params = new URLSearchParams();
  if (filter.query.trim() !== "") params.set("q", filter.query.trim());
  if (filter.tags.length > 0) params.set("tags", filter.tags.join(","));
  if (simulator !== null) {
    params.set("sim", `${simulator.aperture},${simulator.shutterSec},${simulator.iso}`);
  }
  return params.toString();
}

/** クエリ文字列（? 付きでも可）からアプリ状態を復元する。不正な値は静かに無視する */
export function decodeAppState(search: string): AppState {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const query = params.get("q") ?? "";
  const tags = (params.get("tags") ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "" && knownTagIds.has(tag));
  const simRaw = params.get("sim");
  return {
    filter: { query, tags },
    simulator: simRaw === null ? null : normalizeSimulator(simRaw),
  };
}
