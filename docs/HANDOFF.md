# Tokyo Rail Disruption Map Handoff

Last updated: 2026-07-03 JST

## Current State

- Branch: `main`
- Latest pushed commit: `d1e55a3 Refine rail disruption side panel`
- Do not push until the user explicitly approves.
- The old local raw ODPT import workflow and hand-written fallback rail network
  have been removed from the active codebase.

## Product Direction

This app is a Tokyo-area rail disruption dashboard backed by ODPT data.

- Browser calls this app's server API, not ODPT directly.
- Railway master data comes from `odpt:Railway`.
- Current operation notices come from `odpt:TrainInformation`.
- The overview content area uses free OpenStreetMap base tiles plus an
  OpenRailwayMap railway overlay.
- When an abnormal line is selected, the app uses the line name to look up an
  OSM railway route relation and moves the map near that line when available.
- The side panel lists abnormal ODPT lines only.
- The app does not scrape Yahoo, NAVITIME, railway-company websites, or
  unofficial private endpoints.

## Implemented

- Next.js App Router + TypeScript + Tailwind CSS.
- Server route: `GET /api/railway-snapshot`
- Server-side ODPT key usage through `.env.local` / deployment env vars.
- ODPT fetch/mapping files:
  - `src/lib/sources/odpt/client.ts`
  - `src/lib/sources/odpt/types.ts`
  - `src/lib/sources/odpt/railway-network-mapper.ts`
  - `src/lib/sources/odpt/train-information-mapper.ts`
  - `src/lib/sources/odpt/railway-mapping.ts`
- UI files:
  - `src/components/rail-disruption-map.tsx`
  - `src/components/rail-map/railway-tile-overview.tsx`
  - `src/components/rail-map/panels.tsx`
- OSM line lookup helper:
  - `src/lib/sources/osm/line-geo-index.ts`
- I18n:
  - `src/lib/i18n.ts`

## Current UI Behavior

- Header metrics show total ODPT Railway lines, abnormal line count, and latest
  update time.
- Main "operation status overview" card renders OSM/OpenRailwayMap raster tiles
  without an API key.
- Detail panel is shown after an abnormal line is selected.
- Abnormal line panel lists every line whose mapped status is not `normal`.
- No custom SVG schematic or MapLibre map is active.

## Data Notes

- Current API verification on 2026-07-03 returned:
  - `94` ODPT railway lines.
  - `1` abnormal line from ODPT TrainInformation: Toei Shinjuku Line.
- The user's Yahoo screenshot showed more affected lines for the same incident
  family, including Keio lines. That mismatch is currently understood as a data
  source coverage/aggregation difference, not a side-panel rendering cutoff.
- If Yahoo parity becomes a requirement, the project needs another legal data
  source or a documented ingestion strategy. The current policy is not to scrape
  Yahoo.

## Failed Attempts And Lessons

### SVG Topology Attempt

What was tried:

- Render all available railway lines into one custom SVG overview.
- Use ODPT station order and station coordinates when available.
- Highlight abnormal lines and segments directly on the SVG.

Why it failed:

- Only a subset of ODPT Railway records exposes usable `odpt:stationOrder`.
- Geographic station coordinates clustered central Tokyo too tightly for a
  readable all-line diagram.
- A naive projection did not preserve the visual relationships users expect from
  a transit map, such as parallel tracks, transfer geometry, and schematic
  spacing.
- Labels and line overlaps made the overview unreadable.

Lesson:

- Do not attempt a full Tokyo rail schematic from ODPT Railway and Station
  fields alone. A readable schematic needs curated topology, licensed GTFS shape
  data, or a deliberately designed manual/semiautomatic layout layer.

### MapLibre Attempt

What was tried:

- Replace the custom SVG with a token-free MapLibre raster basemap.
- Draw available ODPT station-order geometry as GeoJSON line layers.
- Keep list-only lines for railways that lacked drawable station-order geometry.

Why it failed:

- The result still covered only the drawable subset, leaving most lines out of
  the map.
- The rendered layer added implementation complexity without solving the core
  product problem.
- Local dev and build became noisier because browser map rendering and CSS
  processing introduced extra failure modes.
- The main overview remained visually empty or low value for the user.

Lesson:

- MapLibre is not automatically simpler unless the product is truly a geographic
  map with reliable route geometry. The current approach uses a third-party
  railway tile layer for spatial context and overlays only line-level markers
  that can be matched from the abnormal line name.

### Yahoo Parity Assumption

What was observed:

- Yahoo showed multiple affected Keio-family lines for an incident where ODPT
  TrainInformation returned one Toei Shinjuku Line record.

Lesson:

- The side list should be treated as "ODPT abnormal lines", not "all public
  internet abnormal lines". If the product needs Yahoo-like coverage, decide on a
  legal additional data source or ingestion contract before changing UI logic.

## Verification Commands

```bash
npm run lint
./node_modules/.bin/tsc --noEmit
npm run build
```

Useful local API check:

```bash
curl -sS http://localhost:3000/api/railway-snapshot
```

The map overview uses public OSM/OpenRailwayMap tiles. Keep traffic small, keep
attribution visible, and do not bulk-download or prefetch tiles.

If build fails inside Codex sandbox with a Turbopack/PostCSS port permission
error, rerun `npm run build` outside the sandbox with approval. That specific
error is a sandbox limitation, not necessarily an application build failure.

## Suggested Next Prompt

```text
请先阅读 /Users/akira/Documents/Tokyo Railway Map/docs/HANDOFF.md 和当前 git 状态。
我们要继续 Tokyo Rail Disruption Map。当前总览使用 OSM/OpenRailwayMap 免费铁路瓦片，侧边选择异常线路后根据线路名称定位到 OSM route relation 附近。
右侧异常线路默认只使用 ODPT TrainInformation；先不要接 Yahoo 或网页爬取。
先不要 push，完成本地验证后再问我。
```
