import type {
  Incident,
  LineGeoIndex,
  LineGeoPoint,
  RailLine,
} from "@/lib/types";

const OVERPASS_API_BASE =
  process.env.OVERPASS_API_BASE ?? "https://overpass-api.de/api/interpreter";
const LINE_GEO_REVALIDATE_SECONDS = 7 * 24 * 60 * 60;
const CACHE_TTL_MS = LINE_GEO_REVALIDATE_SECONDS * 1000;
const OVERPASS_TIMEOUT_MS = 10_000;
const TOKYO_AREA_BBOX = {
  south: 34.85,
  west: 138.8,
  north: 36.35,
  east: 140.95,
};

type OverpassElement = {
  id: number;
  center?: {
    lat?: number;
    lon?: number;
  };
  tags?: Record<string, string | undefined>;
};

type OverpassResponse = {
  elements?: OverpassElement[];
};

type CachedLinePoint = {
  expiresAt: number;
  point?: Omit<LineGeoPoint, "id" | "name" | "nameEn">;
};

let linePointCache = new Map<string, CachedLinePoint>();

export async function buildLineGeoIndex(
  lines: RailLine[],
  incidents: Incident[],
): Promise<LineGeoIndex> {
  const affectedLineIds = new Set(
    incidents
      .map((incident) =>
        incident.scope.type === "line" ? incident.scope.lineId : undefined,
      )
      .filter(Boolean) as string[],
  );
  const affectedLines = lines.filter((line) => affectedLineIds.has(line.id));
  const index: LineGeoIndex = {};

  for (const line of affectedLines) {
    const point = await getLinePoint(line);

    if (!point) {
      continue;
    }

    index[line.id] = {
      id: line.id,
      name: line.name,
      nameEn: line.nameEn,
      ...point,
    };
  }

  return index;
}

async function getLinePoint(line: RailLine) {
  const queryName = getLineQueryName(line);

  if (!queryName) {
    return undefined;
  }

  const cached = linePointCache.get(queryName);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.point;
  }

  const point = await fetchLinePoint(line, queryName).catch((error) => {
    console.warn(error);
    return undefined;
  });

  if (point) {
    linePointCache.set(queryName, {
      expiresAt: now + CACHE_TTL_MS,
      point,
    });
  }

  return point;
}

async function fetchLinePoint(line: RailLine, queryName: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);
  const url = new URL(OVERPASS_API_BASE);

  url.searchParams.set("data", buildOverpassLineQuery(queryName));

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "tokyo-rail-disruption-map/0.1",
    },
    next: { revalidate: LINE_GEO_REVALIDATE_SECONDS },
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    throw new Error(
      `Overpass line request failed: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as OverpassResponse;
  const candidates = (data.elements ?? [])
    .map((element) => mapOverpassLine(element, line, queryName))
    .filter(isDefined)
    .sort((a, b) => b.score - a.score);
  const best = candidates[0];

  if (!best) {
    return undefined;
  }

  return {
    lat: best.lat,
    lng: best.lng,
    source: "osm-overpass" as const,
  };
}

function buildOverpassLineQuery(queryName: string) {
  const { south, west, north, east } = TOKYO_AREA_BBOX;
  const bbox = `${south},${west},${north},${east}`;
  const linePattern = escapeOverpassRegex(queryName);

  return `
[out:json][timeout:15];
relation["type"="route"]["route"~"^(subway|train|railway|light_rail)$"]["name:en"~"${linePattern}",i](${bbox});
out center tags;
`.trim();
}

function mapOverpassLine(
  element: OverpassElement,
  line: RailLine,
  queryName: string,
) {
  const lat = element.center?.lat;
  const lng = element.center?.lon;

  if (lat === undefined || lng === undefined) {
    return undefined;
  }

  return {
    lat,
    lng,
    score: scoreLineMatch(element, line, queryName),
  };
}

function scoreLineMatch(
  element: OverpassElement,
  line: RailLine,
  queryName: string,
) {
  const name = `${element.tags?.name ?? ""} ${element.tags?.["name:en"] ?? ""}`;
  const operator = `${element.tags?.operator ?? ""} ${
    element.tags?.["operator:en"] ?? ""
  }`;
  let score = 0;

  if (name.toLowerCase().includes(queryName.toLowerCase())) {
    score += 4;
  }

  if (line.nameEn && name.toLowerCase().includes(line.nameEn.toLowerCase())) {
    score += 2;
  }

  if (line.name && name.includes(line.name)) {
    score += 2;
  }

  if (operator.toLowerCase().includes(line.operator.toLowerCase())) {
    score += 1;
  }

  return score;
}

function getLineQueryName(line: RailLine) {
  const name = line.nameEn ?? line.name;

  return name
    .replace(/\s+Line$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeOverpassRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/"/g, '\\"');
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}
