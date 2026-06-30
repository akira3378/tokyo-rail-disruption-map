# Data Directory

This directory is reserved for local JSON datasets.

Current MVP data lives in TypeScript files under `src/lib/` because it is small and hand-curated for the demo.

When importing real open data, use:

```bash
ODPT_API_KEY=your_key npm run import:odpt
```

Or create `.env.local` in the project root:

```text
ODPT_API_KEY=your_key
```

Then run:

```bash
npm run import:odpt
```

The importer writes raw JSON files to:

```text
data/odpt/raw/
```

Do not commit API keys, private credentials, or data whose license does not allow redistribution.
