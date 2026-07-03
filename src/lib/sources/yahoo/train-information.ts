import type { Incident, RailStatus } from "@/lib/types";

const YAHOO_AREA_URL = "https://transit.yahoo.co.jp/diainfo/area/4";
const YAHOO_BASE_URL = "https://transit.yahoo.co.jp";
const YAHOO_REVALIDATE_SECONDS = 60;

const yahooLineMappings: Record<string, string> = {
  "/diainfo/120/0": "Keikyu-Main",
  "/diainfo/121/0": "Keikyu-Airport",
  "/diainfo/128/0": "Toei-Asakusa",
};

export type YahooTrainInformationRecord = {
  id: string;
  name: string;
  statusText: string;
  detail: string;
  href: string;
  updatedAt: string;
  lineId: string;
  isMappedToOdptLine: boolean;
};

type YahooTroubleRow = {
  name: string;
  statusText: string;
  detail: string;
  href: string;
};

export async function fetchYahooTrainInformation(): Promise<Incident[]> {
  const areaResponse = await fetch(YAHOO_AREA_URL, {
    next: { revalidate: YAHOO_REVALIDATE_SECONDS },
  });

  if (!areaResponse.ok) {
    throw new Error(
      `Yahoo TrainInformation request failed: ${areaResponse.status} ${areaResponse.statusText}`,
    );
  }

  const areaHtml = await areaResponse.text();
  const updatedAt = parseYahooUpdatedAt(areaHtml);
  const rows = parseYahooTroubleRows(areaHtml);
  const records = await Promise.all(
    rows.map(async (row) => ({
      ...row,
      detail: (await fetchYahooDetail(row.href)) ?? row.detail,
    })),
  );

  return records.map((record) => mapYahooRowToIncident(record, updatedAt));
}

function parseYahooTroubleRows(html: string): YahooTroubleRow[] {
  const sectionMatch = html.match(
    /<div id="mdStatusTroubleLine">([\s\S]*?)<div id="mdAreaMajorLine">/,
  );

  if (!sectionMatch) {
    return [];
  }

  return [...sectionMatch[1].matchAll(/<tr><td><a href="([^"]+)">([^<]+)<\/a><\/td><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><\/tr>/g)]
    .map((match) => ({
      href: match[1],
      name: decodeHtml(match[2]),
      statusText: decodeHtml(stripTags(match[3])),
      detail: decodeHtml(stripTags(match[4])),
    }))
    .filter((row) => row.name && row.statusText && row.statusText !== "平常運転");
}

async function fetchYahooDetail(href: string) {
  const url = new URL(href, YAHOO_BASE_URL);
  const response = await fetch(url, {
    next: { revalidate: YAHOO_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    return undefined;
  }

  const html = await response.text();
  const statusText = html.match(/<dt class="icnAlert[^"]*">([\s\S]*?)<\/dt>/)?.[1];
  const detailText = html.match(/<dd class="trouble">([\s\S]*?)<\/dd>/)?.[1];

  if (detailText) {
    return decodeHtml(stripTags(detailText));
  }

  const fallback = html.match(/<h1>[^<]+<\/h1>[\s\S]*?<p class="mt10">([\s\S]*?)<\/p>/)?.[1];

  return fallback ? decodeHtml(stripTags(fallback)) : decodeHtml(stripTags(statusText));
}

function mapYahooRowToIncident(
  row: YahooTroubleRow,
  updatedAt: string,
): Incident {
  const mappedLineId = yahooLineMappings[row.href];
  const lineId = mappedLineId ?? `Yahoo-${row.href.replace(/[^0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  const status = inferYahooStatus(row.statusText);
  const raw: YahooTrainInformationRecord = {
    id: row.href,
    name: row.name,
    statusText: row.statusText,
    detail: row.detail,
    href: new URL(row.href, YAHOO_BASE_URL).toString(),
    updatedAt,
    lineId,
    isMappedToOdptLine: Boolean(mappedLineId),
  };

  return {
    id: `yahoo-${lineId}`,
    status,
    title: `${row.name} ${row.statusText}`,
    lineName: row.name,
    operatorName: "Yahoo!路線情報",
    reason: row.detail,
    scope: {
      type: "line",
      lineId,
    },
    affectedArea: row.name,
    updatedAt,
    note: `Yahoo TrainInformation: ${raw.href}`,
    source: {
      provider: "yahoo",
      resourceType: "yahoo:TrainInformation",
      raw,
    },
  };
}

function inferYahooStatus(statusText: string): Exclude<RailStatus, "normal"> {
  if (/運転見合わせ|運休/.test(statusText)) {
    return "suspended";
  }

  if (/運転本数|減便|一部運休/.test(statusText)) {
    return "reduced";
  }

  if (/遅延|遅れ/.test(statusText)) {
    return "delayed";
  }

  return "unknown";
}

function parseYahooUpdatedAt(html: string) {
  const match = html.match(/(\d{1,2})月(\d{1,2})日\s+(\d{1,2})時(\d{1,2})分\s+更新/);

  if (!match) {
    return new Date().toISOString();
  }

  const [, month, day, hour, minute] = match;
  const year = new Date().getFullYear();

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00+09:00`;
}

function stripTags(value: string | undefined) {
  return value?.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() ?? "";
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}
