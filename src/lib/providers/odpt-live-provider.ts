import type { RailwaySnapshot } from "../types";
import {
  fetchOdptRailways,
  fetchOdptTrainInformation,
  ODPT_REVALIDATE_SECONDS,
} from "../sources/odpt/client";
import { buildLineGeoIndex } from "../sources/osm/line-geo-index";
import { mapOdptRailwaysToNetwork } from "../sources/odpt/railway-network-mapper";
import { mapOdptTrainInformationToOperationSnapshot } from "../sources/odpt/train-information-mapper";
import { fetchYahooTrainInformation } from "../sources/yahoo/train-information";
import { buildRailwaySnapshot } from "./snapshot-builder";

export { ODPT_REVALIDATE_SECONDS };

const ENABLE_YAHOO_SUPPLEMENTAL_SOURCE = false;

export async function getOdptLiveRailwaySnapshot(): Promise<RailwaySnapshot> {
  const [railways, records] = await Promise.all([
    fetchOdptRailways(),
    fetchOdptTrainInformation(),
  ]);
  const fetchedAt = new Date();
  const fetchedLabel = new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Tokyo",
  }).format(fetchedAt);

  const operation = mapOdptTrainInformationToOperationSnapshot(records, {
    id: "odpt-live-snapshot",
    name: "ODPT live snapshot",
    description: `ODPT TrainInformation fetched through the server API at ${fetchedLabel}.`,
  });
  const yahooIncidents = ENABLE_YAHOO_SUPPLEMENTAL_SOURCE
    ? await fetchYahooTrainInformation().catch((error) => {
        console.warn(error);
        return [];
      })
    : [];
  const mergedOperation = {
    ...operation,
    incidents: [...operation.incidents, ...yahooIncidents],
  };

  const network = mapOdptRailwaysToNetwork(railways);
  const lineGeoIndex = await buildLineGeoIndex(
    network.lines,
    mergedOperation.incidents,
  ).catch((error) => {
    console.warn(error);
    return {};
  });

  return buildRailwaySnapshot(mergedOperation, {
    ...network,
    lineGeoIndex,
  });
}
