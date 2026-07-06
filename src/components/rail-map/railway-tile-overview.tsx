"use client";

/* External map tiles are intentionally rendered as plain img elements. */
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import type { copies, Locale } from "@/lib/i18n";
import type { DetailModel } from "@/lib/map/detail-model";
import type { LineGeoIndex } from "@/lib/types";

const TILE_SIZE = 256;
const TILE_RADIUS = 3;
const MIN_ZOOM_OFFSET = -1;
const MAX_ZOOM_OFFSET = 2;
const TOKYO_CENTER = { lat: 35.6812, lng: 139.7671 };

type RailwayTileOverviewProps = {
  copy: (typeof copies)[Locale];
  selectedDetail: DetailModel | null | undefined;
  lineGeoIndex: LineGeoIndex;
};

type Tile = {
  x: number;
  y: number;
  z: number;
  left: number;
  top: number;
};

type ViewMode = "selection" | "overview";

export function RailwayTileOverview({
  copy,
  lineGeoIndex,
  selectedDetail,
}: RailwayTileOverviewProps) {
  const [zoomState, setZoomState] = useState<{
    selectionKey: string | null;
    offset: number;
  }>({ selectionKey: null, offset: 0 });
  const [overviewSelectionKey, setOverviewSelectionKey] = useState<
    string | null
  >(null);
  const target = getSelectedLineTarget(selectedDetail, lineGeoIndex);
  const selectionKey = selectedDetail?.incident?.id ?? null;
  const zoomOffset =
    zoomState.selectionKey === selectionKey ? zoomState.offset : 0;
  const viewMode: ViewMode =
    selectionKey && overviewSelectionKey !== selectionKey
      ? "selection"
      : "overview";
  const baseZoom = viewMode === "overview" ? 10 : target ? 12 : 11;
  const zoom = clamp(baseZoom + zoomOffset, 10, 15);
  const center =
    viewMode === "overview" ? TOKYO_CENTER : (target ?? TOKYO_CENTER);
  const centerWorld = lngLatToWorld(center.lng, center.lat, zoom);
  const tiles = getVisibleTiles(centerWorld, zoom);
  const showLineFallback = Boolean(
    selectedDetail?.incident && !target && viewMode === "selection",
  );

  return (
    <div
      className="relative h-[clamp(380px,calc(100vh-230px),680px)] min-h-0 overflow-hidden bg-[#dfe8df]"
      aria-label={copy.map.ariaLabel}
    >
      <div className="absolute inset-0">
        {tiles.map((tile) => (
          <MapTile key={`osm-${tile.z}-${tile.x}-${tile.y}`} tile={tile} />
        ))}
        {tiles.map((tile) => (
          <RailwayTile key={`rail-${tile.z}-${tile.x}-${tile.y}`} tile={tile} />
        ))}
      </div>

      {target && viewMode === "selection" ? (
        <LineMarker centerWorld={centerWorld} target={target} zoom={zoom} />
      ) : null}

      {showLineFallback ? (
        <LineFallbackMarker copy={copy} selectedDetail={selectedDetail} />
      ) : null}

      <MapSelectionNote copy={copy} target={target} />
      <MapControls
        canZoomIn={zoomOffset < MAX_ZOOM_OFFSET}
        canZoomOut={zoomOffset > MIN_ZOOM_OFFSET}
        copy={copy}
        onOverview={() => {
          setZoomState({ selectionKey, offset: 0 });
          setOverviewSelectionKey(selectionKey);
        }}
        onZoomIn={() =>
          setZoomState({
            selectionKey,
            offset: Math.min(zoomOffset + 1, MAX_ZOOM_OFFSET),
          })
        }
        onZoomOut={() =>
          setZoomState({
            selectionKey,
            offset: Math.max(zoomOffset - 1, MIN_ZOOM_OFFSET),
          })
        }
      />
      <MapAttribution copy={copy} />
    </div>
  );
}

function MapTile({ tile }: { tile: Tile }) {
  return (
    <img
      alt=""
      className="absolute h-64 w-64 select-none"
      draggable={false}
      src={`https://tile.openstreetmap.org/${tile.z}/${tile.x}/${tile.y}.png`}
      style={{
        left: `calc(50% + ${tile.left}px)`,
        top: `calc(50% + ${tile.top}px)`,
      }}
    />
  );
}

function RailwayTile({ tile }: { tile: Tile }) {
  return (
    <img
      alt=""
      className="absolute h-64 w-64 select-none"
      draggable={false}
      src={`https://tiles.openrailwaymap.org/standard/${tile.z}/${tile.x}/${tile.y}.png`}
      style={{
        left: `calc(50% + ${tile.left}px)`,
        top: `calc(50% + ${tile.top}px)`,
      }}
    />
  );
}

type LineMapTarget = {
  name: string;
  lat: number;
  lng: number;
};

function LineMarker({
  centerWorld,
  target,
  zoom,
}: {
  centerWorld: { x: number; y: number };
  target: LineMapTarget;
  zoom: number;
}) {
  const position = lngLatToWorld(target.lng, target.lat, zoom);

  return (
    <div
      className="absolute z-10 -translate-x-1/2 -translate-y-full"
      style={{
        left: `calc(50% + ${(position.x - centerWorld.x) * TILE_SIZE}px)`,
        top: `calc(50% + ${(position.y - centerWorld.y) * TILE_SIZE}px)`,
      }}
    >
      <div className="bg-status-suspended grid place-items-center rounded-full border-2 border-white px-2 py-1 text-xs font-bold text-white shadow-lg">
        !
      </div>
      <div className="border-line bg-panel/95 text-copy mt-1 rounded-md border px-2 py-1 text-xs font-semibold whitespace-nowrap shadow-sm">
        {target.name}
      </div>
    </div>
  );
}

function LineFallbackMarker({
  copy,
  selectedDetail,
}: {
  copy: (typeof copies)[Locale];
  selectedDetail: DetailModel | null | undefined;
}) {
  if (!selectedDetail) {
    return null;
  }

  return (
    <div className="border-line bg-panel/95 absolute top-1/2 left-1/2 z-10 w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-md border px-4 py-3 text-center shadow-lg">
      <div className="text-accent text-xs font-semibold tracking-[0.12em] uppercase">
        {copy.map.lineFallbackLabel}
      </div>
      <div className="text-copy mt-1 text-base font-semibold">
        {selectedDetail.title}
      </div>
      <div className="text-muted mt-1 text-xs leading-5">
        {copy.map.lineFallbackDescription}
      </div>
    </div>
  );
}

function MapSelectionNote({
  copy,
  target,
}: {
  copy: (typeof copies)[Locale];
  target: LineMapTarget | undefined;
}) {
  return (
    <div className="border-line bg-panel/95 text-muted pointer-events-none absolute top-3 right-14 left-3 z-20 max-w-96 rounded-md border px-3 py-2 text-xs leading-5 shadow-sm">
      {target
        ? formatLineNote(copy.map.selectedLine, target)
        : copy.map.noLineTarget}
    </div>
  );
}

function MapControls({
  canZoomIn,
  canZoomOut,
  copy,
  onOverview,
  onZoomIn,
  onZoomOut,
}: {
  canZoomIn: boolean;
  canZoomOut: boolean;
  copy: (typeof copies)[Locale];
  onOverview: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  const buttonClass =
    "border-line text-copy enabled:hover:bg-panel-strong disabled:text-muted grid h-8 w-8 place-items-center border-b text-sm font-bold transition last:border-b-0 disabled:cursor-not-allowed";

  return (
    <div className="border-line bg-panel/95 absolute top-3 right-3 z-20 overflow-hidden rounded-md border shadow-sm">
      <button
        aria-label={copy.map.zoomIn}
        className={buttonClass}
        disabled={!canZoomIn}
        type="button"
        onClick={onZoomIn}
      >
        +
      </button>
      <button
        aria-label={copy.map.resetZoom}
        className={buttonClass}
        type="button"
        onClick={onOverview}
      >
        <FitViewIcon />
      </button>
      <button
        aria-label={copy.map.zoomOut}
        className={buttonClass}
        disabled={!canZoomOut}
        type="button"
        onClick={onZoomOut}
      >
        -
      </button>
    </div>
  );
}

function FitViewIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 20 20"
    >
      <path d="M6.5 3H3v3.5" />
      <path d="M13.5 3H17v3.5" />
      <path d="M17 13.5V17h-3.5" />
      <path d="M3 13.5V17h3.5" />
      <path d="M7 7h6v6H7z" />
    </svg>
  );
}

function MapAttribution({ copy }: { copy: (typeof copies)[Locale] }) {
  return (
    <div className="absolute right-2 bottom-2 z-20 rounded bg-white/90 px-2 py-1 text-[10px] leading-4 text-slate-700 shadow-sm">
      {copy.map.freeLayerLabel}{" "}
      <a className="underline" href="https://www.openstreetmap.org/copyright">
        © OpenStreetMap
      </a>{" "}
      /{" "}
      <a className="underline" href="https://www.openrailwaymap.org/">
        OpenRailwayMap
      </a>
    </div>
  );
}

function getVisibleTiles(centerWorld: { x: number; y: number }, zoom: number) {
  const centerTileX = Math.floor(centerWorld.x);
  const centerTileY = Math.floor(centerWorld.y);
  const maxTile = 2 ** zoom;
  const tiles: Tile[] = [];

  for (let dy = -TILE_RADIUS; dy <= TILE_RADIUS; dy += 1) {
    for (let dx = -TILE_RADIUS; dx <= TILE_RADIUS; dx += 1) {
      const x = wrapTile(centerTileX + dx, maxTile);
      const y = centerTileY + dy;

      if (y < 0 || y >= maxTile) {
        continue;
      }

      tiles.push({
        x,
        y,
        z: zoom,
        left: (centerTileX + dx - centerWorld.x) * TILE_SIZE,
        top: (y - centerWorld.y) * TILE_SIZE,
      });
    }
  }

  return tiles;
}

function lngLatToWorld(lng: number, lat: number, zoom: number) {
  const scale = 2 ** zoom;
  const latRad = (lat * Math.PI) / 180;

  return {
    x: ((lng + 180) / 360) * scale,
    y:
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      scale,
  };
}

function wrapTile(value: number, maxTile: number) {
  return ((value % maxTile) + maxTile) % maxTile;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSelectedLineTarget(
  detail: DetailModel | null | undefined,
  lineGeoIndex: LineGeoIndex,
) {
  const lineId =
    detail?.incident?.scope.type === "line"
      ? detail.incident.scope.lineId
      : undefined;

  if (!lineId) {
    return undefined;
  }

  const point = lineGeoIndex[lineId];

  if (!point) {
    return undefined;
  }

  return {
    name: point.name,
    lat: point.lat,
    lng: point.lng,
  };
}

function formatLineNote(template: string, target: LineMapTarget) {
  return template.replace("{line}", target.name);
}
