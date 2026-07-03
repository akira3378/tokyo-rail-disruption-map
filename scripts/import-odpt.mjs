import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

await loadLocalEnvFiles([".env.local", ".env"]);

const apiKey = process.env.ODPT_API_KEY;
const apiBase = process.env.ODPT_API_BASE ?? "https://api.odpt.org/api/v4";
const outputDir = process.env.ODPT_OUTPUT_DIR ?? "data/odpt/raw";

const allResources = [
  {
    name: "operators",
    path: "odpt:Operator",
    default: true,
  },
  {
    name: "railways",
    path: "odpt:Railway",
    default: true,
  },
  {
    name: "stations",
    path: "odpt:Station",
    default: true,
  },
  {
    name: "train-information",
    path: "odpt:TrainInformation",
    default: true,
  },
  {
    name: "station-timetables",
    path: "odpt:StationTimetable",
    default: false,
  },
  {
    name: "train-timetables",
    path: "odpt:TrainTimetable",
    default: false,
  },
];
const requestedResources = parseResourceList(process.env.ODPT_RESOURCES);
const resources =
  requestedResources.length > 0
    ? allResources.filter((resource) =>
        requestedResources.includes(resource.name),
      )
    : allResources.filter((resource) => resource.default);

if (!apiKey) {
  console.error(
    "ODPT_API_KEY is required. Register for an ODPT key, then run: ODPT_API_KEY=... npm run import:odpt",
  );
  process.exit(1);
}

await mkdir(outputDir, { recursive: true });

const startedAt = new Date().toISOString();
const manifest = {
  fetchedAt: startedAt,
  apiBase,
  outputDir,
  resources: [],
};

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
  const recordCount = Array.isArray(payload) ? payload.length : 1;

  await writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  manifest.resources.push({
    name: resource.name,
    path: resource.path,
    records: recordCount,
    file: filePath,
  });
  console.log(`Wrote ${filePath} (${recordCount} records)`);
}

await writeFile(
  "data/odpt/manifest.json",
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);
console.log(
  `Wrote data/odpt/manifest.json (${resources.length} resources, fetched ${startedAt})`,
);

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

function parseResourceList(value) {
  if (!value) {
    return [];
  }

  const requested = value
    .split(",")
    .map((resource) => resource.trim())
    .filter(Boolean);
  const knownNames = new Set(allResources.map((resource) => resource.name));
  const unknown = requested.filter((resource) => !knownNames.has(resource));

  if (unknown.length > 0) {
    throw new Error(
      `Unknown ODPT_RESOURCES values: ${unknown.join(", ")}. Known values: ${[
        ...knownNames,
      ].join(", ")}`,
    );
  }

  return requested;
}
