import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const apiKey = process.env.ODPT_API_KEY;
const apiBase = process.env.ODPT_API_BASE ?? "https://api.odpt.org/api/v4";
const outputDir = process.env.ODPT_OUTPUT_DIR ?? "data/odpt/raw";

const resources = [
  {
    name: "railways",
    path: "odpt:Railway",
  },
  {
    name: "stations",
    path: "odpt:Station",
  },
  {
    name: "train-information",
    path: "odpt:TrainInformation",
  },
];

if (!apiKey) {
  console.error(
    "ODPT_API_KEY is required. Register for an ODPT key, then run: ODPT_API_KEY=... npm run import:odpt",
  );
  process.exit(1);
}

await mkdir(outputDir, { recursive: true });

for (const resource of resources) {
  const url = new URL(`${apiBase}/${resource.path}`);
  url.searchParams.set("acl:consumerKey", apiKey);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${resource.path}: ${response.status} ${response.statusText}`,
    );
  }

  const payload = await response.json();
  const filePath = join(outputDir, `${resource.name}.json`);

  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${filePath} (${Array.isArray(payload) ? payload.length : 1} records)`);
}
