# Data Source Strategy

This project uses documented transport data sources without scraping websites.

## Current Position

The current MVP reads ODPT TrainInformation through this app's server API route.
It does not fetch, crawl, cache, or republish data from Yahoo, NAVITIME, railway
operator websites, or official route-map pages.

## Recommended Primary Source

The best legal first candidate for Tokyo-area railway data is the Public Transportation Open Data Center / ODPT API:

- Website: https://www.odpt.org/
- Developer portal: https://developer.odpt.org/
- API base commonly used by ODPT examples: `https://api.odpt.org/api/v4`

The useful entity groups for this application are:

- `odpt:Operator`: operator metadata
- `odpt:Railway`: railway line metadata
- `odpt:Station`: station metadata
- `odpt:TrainInformation`: operation information notices
- `odpt:StationTimetable`: station-level timetable metadata where available
- `odpt:TrainTimetable`: train-level timetable metadata where available

The live implementation uses `src/app/api/railway-snapshot/route.ts` and
`src/lib/sources/odpt/client.ts`. The repository also includes
`scripts/import-odpt.mjs` for local inspection of operator, railway, station,
and TrainInformation records while developing mappers.

## ODPT Integration Boundary

The app keeps source-specific data outside React components:

```text
ODPT TrainInformation response
        ↓
sources/odpt/client.ts
        ↓
sources/odpt/train-information-mapper.ts
        ↓
RailwaySnapshot
        ↓
UI components
```

The mapper reads source-style fields such as:

- `@context`
- `@type`
- `owl:sameAs`
- `dc:date`
- `dct:valid`
- `odpt:operator`
- `odpt:railway`
- `odpt:railwayTitle`
- `odpt:trainInformationStatus`
- `odpt:trainInformationCause`
- `odpt:trainInformationRange`
- `odpt:trainInformationText`

`src/lib/sources/odpt/train-information-mapper.ts` maps only what the UI needs:
ODPT railway id to the current schematic line id, TrainInformation status to a
visual status, and the source record to a clickable incident. The original ODPT
record remains attached on `Incident.source.raw`, so details and future panels
can read fields such as `odpt:trainInformationStatus`,
`odpt:trainInformationRange`, `odpt:trainInformationCause`,
`odpt:trainInformationText`, and `dct:valid` without inventing replacement
fields.

## Why Not Scrape Free Public Websites

Some railway information pages are publicly visible without login, but that does not make them safe or appropriate to scrape. For this portfolio project, the rule is:

- use documented APIs or licensed datasets
- keep attribution and license notes with imported data
- do not scrape HTML pages or private app endpoints
- do not copy official map artwork or visual layouts

This keeps the project defensible in interviews and deployable without legal ambiguity.

## Refresh Plan

The project can support two update loops:

1. Static network data
   - Source: `odpt:Railway`, `odpt:Station`, or GTFS static feeds
   - Suggested refresh: daily or weekly
   - Storage: JSON in `data/` for early development, database table later

2. Operation information
   - Source: `odpt:TrainInformation` or GTFS-RT alerts where available
   - Suggested refresh: every 60 seconds in development, every 1-5 minutes in production depending on API terms and rate limits
   - Storage: short-lived cache or database table with `fetchedAt`, `source`, and `expiresAt`

## Database Migration Path

JSON is enough for the first iteration. Supabase becomes useful when the project needs:

- scheduled ingestion jobs
- historical incident records
- source freshness monitoring
- admin review of normalized incidents
- user-specific saved routes or alert preferences

Suggested future tables:

- `operators`
- `lines`
- `stations`
- `line_stations`
- `incidents`
- `source_fetches`

## Normalization Boundary

Raw provider data should not leak into UI components. A provider should normalize source data into the local model:

```text
provider raw response
        ↓
source-specific mapper
        ↓
RailwaySnapshot
        ↓
UI components
```

This lets the app move from local ODPT JSON to scheduled ingestion, GTFS-RT, or
another licensed provider without rewriting the map UI.
