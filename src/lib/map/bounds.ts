import type { LineViewModel, Station } from "@/lib/types";
import {
  DEFAULT_ZOOM,
  FOCUS_PADDING,
  MAP_HEIGHT,
  MAP_WIDTH,
  MAX_ZOOM,
  MIN_ZOOM,
} from "./constants";

export type MapBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
}

export function getFitZoom(viewport: HTMLDivElement) {
  const widthRatio = viewport.clientWidth / MAP_WIDTH;
  const heightRatio = viewport.clientHeight / MAP_HEIGHT;

  return clampZoom(Math.min(DEFAULT_ZOOM, widthRatio, heightRatio));
}

export function getBoundsZoom(viewport: HTMLDivElement, bounds: MapBounds) {
  const width = bounds.maxX - bounds.minX + FOCUS_PADDING * 2;
  const height = bounds.maxY - bounds.minY + FOCUS_PADDING * 2;
  const widthRatio = viewport.clientWidth / width;
  const heightRatio = viewport.clientHeight / height;

  return clampZoom(Math.min(MAX_ZOOM, widthRatio, heightRatio));
}

export function getLineBounds(
  lines: LineViewModel[],
  stationById: Map<string, Station>,
  lineId: string,
) {
  const line = lines.find((item) => item.id === lineId);

  if (!line) {
    return undefined;
  }

  return getStationIdsBounds(line.stationIds, stationById);
}

export function getSegmentBounds(
  lines: LineViewModel[],
  stationById: Map<string, Station>,
  segmentId: string,
  lineId: string,
) {
  const line = lines.find((item) => item.id === lineId);
  const segment = line?.segments.find((item) => item.id === segmentId);

  if (!segment) {
    return undefined;
  }

  return getStationIdsBounds(
    [segment.fromStationId, segment.toStationId],
    stationById,
  );
}

function getStationIdsBounds(
  stationIds: string[],
  stationById: Map<string, Station>,
): MapBounds | undefined {
  const stations = stationIds
    .map((stationId) => stationById.get(stationId))
    .filter((station): station is Station => Boolean(station));

  if (stations.length === 0) {
    return undefined;
  }

  return stations.reduce<MapBounds>(
    (bounds, station) => ({
      minX: Math.min(bounds.minX, station.x),
      maxX: Math.max(bounds.maxX, station.x),
      minY: Math.min(bounds.minY, station.y),
      maxY: Math.max(bounds.maxY, station.y),
    }),
    {
      minX: stations[0].x,
      maxX: stations[0].x,
      minY: stations[0].y,
      maxY: stations[0].y,
    },
  );
}
