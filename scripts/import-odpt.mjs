import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

await loadLocalEnvFiles([".env.local", ".env"]);

const apiKey = process.env.ODPT_API_KEY;
const apiBase = process.env.ODPT_API_BASE ?? "https://api.odpt.org/api/v4";
const outputDir = process.env.ODPT_OUTPUT_DIR ?? "data/odpt/raw";

const resources = [
  {
    name: "operators",
    path: "odpt:Operator",
  },
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
  {
    name: "station-timetables",
    path: "odpt:StationTimetable",
  },
  {
    name: "train-timetables",
    path: "odpt:TrainTimetable",
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
  console.log(
    `Wrote ${filePath} (${Array.isArray(payload) ? payload.length : 1} records)`,
  );
}

async function loadLocalEnvFiles(paths) {
  for (const path of paths) {
    let content;

    try {
      content = await readFile(path, "utf8");
    } catch {
      continue;
    }

    for (const line of content.split("\n")) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex < 1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      const value = rawValue.replace(/^["']|["']$/g, "");

      process.env[key] ??= value;
    }
  }
}
