import { readFile } from "node:fs/promises";
import { join } from "node:path";

const inputDir = process.env.ODPT_OUTPUT_DIR ?? "data/odpt/raw";
const requiredFiles = [
  "operators.json",
  "railways.json",
  "stations.json",
  "train-information.json",
];
const optionalFiles = ["station-timetables.json", "train-timetables.json"];
const manifestFile = "data/odpt/manifest.json";

let hasError = false;

for (const fileName of [...requiredFiles, ...optionalFiles]) {
  const filePath = join(inputDir, fileName);
  const required = requiredFiles.includes(fileName);

  try {
    const content = await readFile(filePath, "utf8");
    const payload = JSON.parse(content);
    const count = Array.isArray(payload) ? payload.length : 1;

    if (count === 0 && required) {
      hasError = true;
      console.error(`Empty required dataset: ${filePath}`);
      continue;
    }

    console.log(`${required ? "required" : "optional"} ${fileName}: ${count} records`);
  } catch (error) {
    if (required) {
      hasError = true;
      console.error(`Missing or invalid required dataset: ${filePath}`);
      console.error(error instanceof Error ? error.message : String(error));
    } else {
      console.warn(`optional ${fileName}: not available`);
    }
  }
}

try {
  const manifest = JSON.parse(await readFile(manifestFile, "utf8"));
  const resources = Array.isArray(manifest.resources)
    ? manifest.resources.length
    : 0;

  console.log(`manifest: ${resources} resources fetched at ${manifest.fetchedAt}`);
} catch (error) {
  hasError = true;
  console.error(`Missing or invalid manifest: ${manifestFile}`);
  console.error(error instanceof Error ? error.message : String(error));
}

if (hasError) {
  process.exit(1);
}
