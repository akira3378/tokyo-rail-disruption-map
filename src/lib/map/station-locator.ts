import type { DetailModel } from "./detail-model";

export type StationMapTarget = {
  name: string;
  lat: number;
  lng: number;
};

const stationCoordinates: Record<string, { lat: number; lng: number }> = {
  新宿: { lat: 35.6896, lng: 139.7006 },
  渋谷: { lat: 35.658, lng: 139.7016 },
  池袋: { lat: 35.7295, lng: 139.7109 },
  東京: { lat: 35.6812, lng: 139.7671 },
  上野: { lat: 35.7138, lng: 139.7773 },
  品川: { lat: 35.6285, lng: 139.7388 },
  大崎: { lat: 35.6197, lng: 139.7286 },
  目黒: { lat: 35.6339, lng: 139.7157 },
  大手町: { lat: 35.6848, lng: 139.7663 },
  押上: { lat: 35.7101, lng: 139.8129 },
  浅草: { lat: 35.7112, lng: 139.7964 },
  日本橋: { lat: 35.6827, lng: 139.7746 },
  東銀座: { lat: 35.6695, lng: 139.7672 },
  新橋: { lat: 35.6663, lng: 139.7586 },
  大門: { lat: 35.6564, lng: 139.7543 },
  泉岳寺: { lat: 35.6387, lng: 139.7399 },
  三田: { lat: 35.6482, lng: 139.7488 },
  有楽町: { lat: 35.6751, lng: 139.7633 },
  飯田橋: { lat: 35.7021, lng: 139.745 },
  永田町: { lat: 35.6788, lng: 139.7403 },
  市ケ谷: { lat: 35.691, lng: 139.7356 },
  表参道: { lat: 35.6652, lng: 139.7125 },
  青山一丁目: { lat: 35.6728, lng: 139.7242 },
  二子玉川: { lat: 35.6115, lng: 139.6264 },
  溝の口: { lat: 35.5998, lng: 139.6109 },
  三軒茶屋: { lat: 35.6437, lng: 139.6718 },
  南町田: { lat: 35.5117, lng: 139.4704 },
  川崎: { lat: 35.5313, lng: 139.6968 },
  武蔵小杉: { lat: 35.5758, lng: 139.6631 },
  登戸: { lat: 35.6207, lng: 139.5707 },
  立川: { lat: 35.6984, lng: 139.4136 },
  横浜: { lat: 35.4658, lng: 139.6223 },
  大船: { lat: 35.3535, lng: 139.5311 },
  鎌倉: { lat: 35.3192, lng: 139.5503 },
  千葉: { lat: 35.6134, lng: 140.1131 },
  物井: { lat: 35.6856, lng: 140.2003 },
  成田空港: { lat: 35.7647, lng: 140.3863 },
  銚子: { lat: 35.7297, lng: 140.8274 },
  鹿島神宮: { lat: 35.9696, lng: 140.6247 },
  下高井戸: { lat: 35.666, lng: 139.6424 },
  桜上水: { lat: 35.6677, lng: 139.6315 },
  京王八王子: { lat: 35.6579, lng: 139.3428 },
  調布: { lat: 35.6518, lng: 139.5447 },
  明大前: { lat: 35.6688, lng: 139.6505 },
  京急久里浜: { lat: 35.2316, lng: 139.7026 },
  "羽田空港第1・第2ターミナル": { lat: 35.5494, lng: 139.7861 },
  "羽田空港第3ターミナル": { lat: 35.5448, lng: 139.7686 },
};

const stationNames = Object.keys(stationCoordinates).sort(
  (a, b) => b.length - a.length,
);

export function extractStationTargets(
  detail: DetailModel | null | undefined,
): StationMapTarget[] {
  if (!detail?.incident) {
    return [];
  }

  const sourceText = [detail.affectedArea, detail.incident.reason]
    .filter(Boolean)
    .join(" ");

  const targets: StationMapTarget[] = [];
  const seen = new Set<string>();

  for (const stationName of stationNames) {
    if (!hasStationContext(sourceText, stationName) || seen.has(stationName)) {
      continue;
    }

    seen.add(stationName);
    targets.push({
      name: stationName,
      ...stationCoordinates[stationName],
    });
  }

  return targets.slice(0, 6);
}

function hasStationContext(text: string, stationName: string) {
  const normalizedText = normalizeStationText(text);
  const normalizedName = normalizeStationText(stationName);
  const escapedName = escapeRegExp(normalizedName);

  return [
    new RegExp(`${escapedName}駅`),
    new RegExp(`${escapedName}(?:付近|構内|方面|行き|間|から|まで)`),
    new RegExp(`(?:〜|～|-|－|—|―)${escapedName}`),
    new RegExp(`${escapedName}(?:〜|～|-|－|—|―)`),
  ].some((pattern) => pattern.test(normalizedText));
}

function normalizeStationText(value: string) {
  return value.replace(/[ 　]/g, "").replace(/[ヶケ]/g, "ケ").toLowerCase();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
