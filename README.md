# Tokyo Rail Disruption Map

Tokyo Rail Disruption Map is a portfolio MVP for visualizing rail disruption states in the Tokyo metropolitan area. It focuses on frontend interaction, structured domain data, and a legal ODPT-based ingestion path.

The current version reads locally imported ODPT TrainInformation data. It does not scrape Yahoo, NAVITIME, railway operator websites, official rail maps, or any other third-party website.

## Why This Project

Rail disruption information is operationally dense: users need to understand which line is affected, whether the issue is line-wide or section-specific, what the status means, and when the information changed.

This project demonstrates:

- structured data modeling for lines, stations, segments, incidents, and data snapshots
- interactive SVG visualization without copying official map designs
- responsive dashboard UI for desktop and mobile
- a clean data access layer backed by a documented open transport data source
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
- ODPT TrainInformation local import and validation scripts
- Single current-data snapshot on the main page, with an offline empty fallback if no local ODPT cache exists
- Responsive layout for desktop and mobile screens
- No database dependency in the first ODPT-backed MVP

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
- `DemoScenario`: currently used as a named data snapshot container
- `RailwaySnapshot`: resolved view model consumed by the UI

Static rail network data lives in `src/lib/rail-network.ts`.

ODPT data is imported with `scripts/import-odpt.mjs`, validated with
`scripts/validate-odpt-data.mjs`, and normalized through:

- `src/lib/providers/odpt-normalizer.ts`: maps source records into local `Incident` objects
- `src/lib/providers/odpt-import-provider.ts`: reads local ODPT cache and creates the current snapshot
- `src/lib/providers/snapshot-builder.ts`: resolves incidents into line and segment view models

The UI reads data through `src/lib/data-access.ts`, not directly from ODPT raw files. Raw provider data is kept out of React components.

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
    providers/
      odpt-import-provider.ts
      odpt-normalizer.ts
      odpt-types.ts
      snapshot-builder.ts
    rail-network.ts
    status.ts
    types.ts
```

### Data Flow

```text
ODPT TrainInformation import
        ↓
data/odpt/raw/train-information.json
        ↓
odpt-import-provider
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

No map SDK, database, or crawler is used in this MVP.

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

For ODPT-backed local data, create `.env.local` with `ODPT_API_KEY`.

## Data Source Policy

Current version:

- uses locally imported ODPT TrainInformation data
- does not crawl third-party websites
- does not commit or republish raw third-party railway operation data
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

The script fetches documented ODPT resources and stores JSON in `data/odpt/raw/`.
Local raw ODPT files are ignored by git so the project does not republish provider
data by accident.

Default import scope:

- `odpt:Operator`
- `odpt:Railway`
- `odpt:Station`
- `odpt:TrainInformation`

Large timetable resources are opt-in because they are not needed for the
disruption-map MVP:

```bash
ODPT_RESOURCES=operators,railways,stations,train-information,station-timetables,train-timetables npm run import:odpt
```

Opt-in resources:

- `odpt:StationTimetable`
- `odpt:TrainTimetable`

The page uses the imported TrainInformation cache through `odpt-import-provider`.

After importing, validate local JSON readiness with:

```bash
npm run validate:odpt
```

ODPT usage note: the official terms reviewed for this project do not describe
per-request billing for the API itself. They do state that provider/network
connection costs are borne by the user, that ODPT may define limits on API call
counts and access timing, and that API calls should be kept to the minimum
necessary. Production ingestion should therefore poll from a server-side cache
or scheduled job rather than calling ODPT from every end-user browser session.

## Future Extensions

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
