import type {
  OdptRailwayRecord,
  OdptTrainInformationRecord,
} from "./types";

export const ODPT_API_BASE = "https://api.odpt.org/api/v4";
export const ODPT_REVALIDATE_SECONDS = 60;

type OdptFetchOptions = {
  apiKey?: string;
  apiBase?: string;
};

export async function fetchOdptTrainInformation({
  apiKey = process.env.ODPT_API_KEY,
  apiBase = process.env.ODPT_API_BASE ?? ODPT_API_BASE,
}: OdptFetchOptions = {}): Promise<OdptTrainInformationRecord[]> {
  if (!apiKey) {
    throw new Error("ODPT_API_KEY is not configured.");
  }

  const url = new URL(`${apiBase}/odpt:TrainInformation`);
  url.searchParams.set("acl:consumerKey", apiKey);

  const response = await fetch(url, {
    next: { revalidate: ODPT_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(
      `ODPT TrainInformation request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as OdptTrainInformationRecord[];
}

export async function fetchOdptRailways({
  apiKey = process.env.ODPT_API_KEY,
  apiBase = process.env.ODPT_API_BASE ?? ODPT_API_BASE,
}: OdptFetchOptions = {}): Promise<OdptRailwayRecord[]> {
  if (!apiKey) {
    throw new Error("ODPT_API_KEY is not configured.");
  }

  const url = new URL(`${apiBase}/odpt:Railway`);
  url.searchParams.set("acl:consumerKey", apiKey);

  const response = await fetch(url, {
    next: { revalidate: ODPT_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(
      `ODPT Railway request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as OdptRailwayRecord[];
}
