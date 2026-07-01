import { copies, statusCopies, type Locale } from "@/lib/i18n";
import type { Incident, RailwaySnapshot, RailStatus, Selection } from "@/lib/types";

export type DetailModel = {
  title: string;
  subtitle: string;
  status: RailStatus;
  incident?: Incident;
  affectedArea: string;
};

export function buildDetailModel(
  snapshot: RailwaySnapshot,
  selection: Selection | null,
  locale: Locale,
): DetailModel | undefined {
  if (!selection) {
    return undefined;
  }

  const statusText = statusCopies[locale];

  if (selection.type === "line") {
    const line = snapshot.lines.find((item) => item.id === selection.lineId);

    if (!line) {
      return undefined;
    }

    return {
      title: line.name,
      subtitle: `${line.operator} / ${statusText[line.status].description}`,
      status: line.status,
      incident: line.incident,
      affectedArea:
        line.incident?.affectedArea ?? copies[locale].detail.noLineIncident,
    };
  }

  const line = snapshot.lines.find((item) => item.id === selection.lineId);
  const segment = line?.segments.find(
    (item) => item.id === selection.segmentId,
  );

  if (!line || !segment) {
    return undefined;
  }

  const from = snapshot.stations.find(
    (station) => station.id === segment.fromStationId,
  );
  const to = snapshot.stations.find(
    (station) => station.id === segment.toStationId,
  );
  const stationRange = `${from?.name ?? segment.fromStationId}〜${
    to?.name ?? segment.toStationId
  }`;

  return {
    title: `${line.name} ${stationRange}`,
    subtitle: statusText[segment.status].description,
    status: segment.status,
    incident: segment.incident,
    affectedArea: segment.incident?.affectedArea ?? stationRange,
  };
}
