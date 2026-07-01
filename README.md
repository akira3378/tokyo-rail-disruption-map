# Tokyo Rail Disruption Map

Tokyo Rail Disruption Map is a portfolio MVP for visualizing simulated rail disruption states in the Tokyo metropolitan area. It focuses on frontend interaction, structured domain data, and an architecture that can later be extended to legal real-time transport data sources.

The first version uses mock data only. It does not scrape Yahoo, NAVITIME, railway operator websites, official rail maps, or any other third-party website.

## Why This Project

Rail disruption information is operationally dense: users need to understand which line is affected, whether the issue is line-wide or section-specific, what the status means, and when the information changed.

This project demonstrates:

- structured data modeling for lines, stations, segments, incidents, and demo scenarios
- interactive SVG visualization without copying official map designs
- responsive dashboard UI for desktop and mobile
- a clean data access layer that can be replaced later by a real API integration
- a deployment-ready Next.js application for Vercel

## Features

- Simplified custom schematic map for selected Tokyo-area rail lines
- Structured rail network data instead of hard-coded UI-only line definitions
- Structured incident data with line-level and section-level scopes
- Distinct visual states:
  - Normal
  - Delayed
  - Suspended
  - Reduced service
  - Unknown
- Clickable lines and segments with detail panel
- Chinese, Japanese, and English interface copy managed through a typed dictionary
- Light and dark display modes using shared design tokens
- Map zoom controls with bounded scale and reset
- Demo scenario switcher:
  - All normal
  - Tokyu Den-en-toshi Line section suspension from Shibuya to Futako-tamagawa
  - Tokyo Metro Hanzomon Line delay caused by through-service impact
  - Multiple simultaneous disruptions
- Responsive layout for desktop and mobile screens
- No database or backend dependency in the first MVP

## Included Lines

- 東急田園都市線
- 東京メトロ半蔵門線
- JR山手線
- JR南武線
- 横須賀線

## Data Structure Design

The application separates the domain model from the UI.

Core data types live in `src/lib/types.ts`:

- `Station`: station id, display names, and schematic coordinates
- `Station.display`: optional metadata for major stations, transfers, and mobile label priority
- `RailLine`: operator, color, ordered station ids, and optional display importance
- `Segment`: line section between two adjacent stations
- `Incident`: abnormal operation information
- `DemoScenario`: a named set of incidents for portfolio demonstrations
- `RailwaySnapshot`: resolved view model consumed by the UI

Static rail network data lives in `src/lib/rail-network.ts`.

Mock scenarios are generated from ODPT-like train information fixtures:

- `src/lib/providers/odpt-mock-train-information.ts`: simulated `odpt:TrainInformation` records
- `src/lib/providers/odpt-normalizer.ts`: maps source records into local `Incident` objects
- `src/lib/demo-scenarios.ts`: exposes normalized demo scenarios to the provider

This keeps the MVP demonstrable while matching the shape of a future official data integration.

The UI reads data through `src/lib/data-access.ts`, not directly from mock files. This keeps the first MVP simple while leaving a clear replacement point for a future real data provider.

## Architecture

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    rail-disruption-map.tsx
  lib/
    data-access.ts
    demo-scenarios.ts
    providers/
      odpt-mock-train-information.ts
      odpt-normalizer.ts
      odpt-types.ts
    rail-network.ts
    status.ts
    types.ts
```

### Data Flow

```text
Demo scenario selection
        ↓
getRailwaySnapshot(scenarioId)
        ↓
ODPT-like fixture records
        ↓
Normalized Incident objects
        ↓
Resolved line and segment statuses
        ↓
SVG map, status list, and detail panel
```

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- SVG for the custom schematic map

No map SDK, database, backend service, or crawler is used in the MVP.

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

## Deployment

This project is designed to deploy to Vercel as a standard Next.js application.

Recommended flow:

1. Push the repository to GitHub.
2. Import the GitHub repository in Vercel.
3. Use the default framework preset for Next.js.
4. Keep the default build command:

```bash
npm run build
```

No environment variables are required for the MVP.

## Data Source Policy

Current version:

- uses simulated local mock data only
- does not crawl third-party websites
- does not republish third-party railway operation data
- does not copy official railway map visual designs

Future real-data versions should use legal and documented data sources, such as:

- public transport open data APIs where permitted
- GTFS-RT feeds where available and licensed for the intended use
- a backend service that normalizes provider-specific data into the local `RailwaySnapshot` model

See `docs/DATA_SOURCES.md` for the recommended ODPT/GTFS data-source strategy.

## Open Data Import Path

The repository includes a non-scraping ODPT import script:

```bash
ODPT_API_KEY=your_key npm run import:odpt
```

The script fetches documented ODPT resources and stores JSON in `data/odpt/raw/`:

- `odpt:Operator`
- `odpt:Railway`
- `odpt:Station`
- `odpt:TrainInformation`
- `odpt:StationTimetable`
- `odpt:TrainTimetable`

This is intentionally separate from the UI. The next step would be a mapper that converts provider-specific records into this app's `RailwaySnapshot` model.

After importing, validate local JSON readiness with:

```bash
npm run validate:odpt
```

## Future Extensions

- Replace mock scenarios with a real provider implementation behind the same data access interface
- Import all available Tokyo-area lines and stations from ODPT or licensed GTFS static data
- Poll licensed operation information every 60 seconds in development or every 1-5 minutes in production, depending on provider terms
- Add timestamp freshness indicators and stale-data warnings
- Add station search and line filtering
- Add route impact summaries
- Add API route handlers for normalized incident snapshots
- Add tests for incident-to-segment resolution logic
- Add observability for real production data ingestion if a backend is introduced

## MVP Boundary

The first release intentionally avoids backend infrastructure and persistent storage. A database such as Supabase would become useful only after adding user-specific saved views, historical incident archives, authentication, or server-side ingestion jobs.
