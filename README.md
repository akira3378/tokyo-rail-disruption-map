# Tokyo Rail Disruption Map

Tokyo Rail Disruption Map is a portfolio MVP for visualizing rail disruption states in the Tokyo metropolitan area. It focuses on frontend interaction, structured domain data, and a legal ODPT-based ingestion path.

The current version reads ODPT TrainInformation through a server API route. It does not scrape Yahoo, NAVITIME, railway operator websites, official rail maps, or any other third-party website.

## Why This Project

Rail disruption information is operationally dense: users need to understand which line is affected, whether the issue is line-wide or section-specific, what the status means, and when the information changed.

This project demonstrates:

- structured data modeling for lines, incidents, and data snapshots
- public-transit map overview with station markers for selected disruptions
- responsive dashboard UI for desktop and mobile
- a clean data access layer backed by a documented open transport data source
- a deployment-ready Next.js application for Vercel

## Features

- ODPT Railway-backed operation status overview for Tokyo-area rail lines
- ODPT Railway-backed line list instead of hard-coded UI-only line definitions
- Structured incident data with line-level scopes
- Distinct visual states:
  - Normal
  - Delayed
  - Suspended
  - Reduced service
  - Unknown
- Clickable abnormal line list with detail panel
- Chinese, Japanese, and English interface copy managed through a typed dictionary
- Light and dark display modes using shared design tokens
- Free OSM/OpenRailwayMap tile overview with station markers for selected disruptions
- ODPT TrainInformation server API route with short cache headers
- Single current-data snapshot on the main page, refreshed by the browser every 60 seconds
- Responsive layout for desktop and mobile screens
- No database dependency in the first ODPT-backed MVP

## Data Structure Design

The application separates the domain model from the UI.

Core data types live in `src/lib/types.ts`:

- `Station`: station id and optional display metadata retained for future station data
- `RailLine`: operator, color, and source metadata
- `Segment`: optional line section model retained for future provider data
- `Incident`: abnormal operation information
- `OperationSnapshot`: current provider snapshot with resolved incident records
- `RailwaySnapshot`: UI-ready view model with lines and the current `operation`

ODPT live data is fetched by a server API route and mapped through source
adapters:

- `src/app/api/railway-snapshot/route.ts`: server-only endpoint called by the browser
- `src/lib/sources/odpt/client.ts`: ODPT API client with short revalidation
- `src/lib/sources/odpt/types.ts`: ODPT JSON-LD source types, with Train/Bus/Airplane extension points
- `src/lib/sources/odpt/train-information-mapper.ts`: minimal TrainInformation-to-UI adapter
- `src/lib/providers/snapshot-builder.ts`: resolves incidents into line and segment view models

The browser never receives the ODPT API key and never calls ODPT directly. It
only calls this app's `/api/railway-snapshot` endpoint.

## Architecture

```text
src/
  app/
    api/
      railway-snapshot/
        route.ts
    layout.tsx
    page.tsx
    globals.css
  components/
    rail-disruption-map.tsx
  lib/
    data-access.ts
    providers/
      odpt-live-provider.ts
      snapshot-builder.ts
    sources/
      odpt/
        client.ts
        railway-network-mapper.ts
        railway-mapping.ts
        train-information-mapper.ts
        types.ts
    status.ts
    types.ts
```

### Data Flow

```text
Browser
        ↓
/api/railway-snapshot
        ↓
ODPT TrainInformation API
        ↓
Source fields + minimal UI adapter
        ↓
Resolved line statuses
        ↓
Transit map overview, status list, and detail panel
```

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- OpenStreetMap and OpenRailwayMap raster tiles for the free railway overview

No database or crawler is used in this MVP.

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

Configure `ODPT_API_KEY` in `.env.local` for local development and in Vercel
environment variables for deployment. The key is server-only and is never sent
to the browser.

The map overview uses public OpenStreetMap and OpenRailwayMap tiles directly in
the browser. Keep usage small, show attribution, and do not bulk-download or
prefetch tiles.

## Data Source Policy

Current version:

- uses ODPT TrainInformation through `/api/railway-snapshot`
- does not crawl third-party websites
- does not commit or republish raw third-party railway operation data
- does not copy official railway map visual designs

Future real-data versions should use legal and documented data sources, such as:

- public transport open data APIs where permitted
- GTFS-RT feeds where available and licensed for the intended use
- a backend service that normalizes provider-specific data into the local `RailwaySnapshot` model

See `docs/DATA_SOURCES.md` for the recommended ODPT/GTFS data-source strategy.

## Open Data Integration

Production data flow uses the server API route:

```text
GET /api/railway-snapshot
```

The route reads `ODPT_API_KEY` from server environment variables, calls
`odpt:TrainInformation`, and returns a normalized `RailwaySnapshot` to the
browser. Responses use a short server cache to avoid unnecessary ODPT calls.

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

## Development Handoff

For continuing this project in a fresh Codex conversation, read
`docs/HANDOFF.md` first. It summarizes the current implementation, data-source
decisions, failed visualization attempts, lessons learned, verification
commands, and recommended next steps.

## MVP Boundary

The first release intentionally avoids backend infrastructure and persistent storage. A database such as Supabase would become useful only after adding user-specific saved views, historical incident archives, authentication, or server-side ingestion jobs.
