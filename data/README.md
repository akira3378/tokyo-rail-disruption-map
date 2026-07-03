# Data Directory

This directory is reserved for local JSON datasets.

The running app fetches ODPT TrainInformation through the server API route.
Local JSON under `data/odpt/raw/` is only for inspection and mapper development.
Those raw files are ignored by git and should not be committed unless the
specific dataset license explicitly allows redistribution.

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
