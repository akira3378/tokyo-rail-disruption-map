import {
  lines as fallbackLines,
  segments as fallbackSegments,
  stations as fallbackStations,
} from "../rail-network";
import type {
  OperationSnapshot,
  Incident,
  LineViewModel,
  RailLine,
  RailStatus,
  RailwaySnapshot,
  Segment,
  SegmentViewModel,
  Station,
} from "../types";

const statusPriority: Record<RailStatus, number> = {
  normal: 0,
  unknown: 1,
  reduced: 2,
  delayed: 3,
  suspended: 4,
};

export function buildRailwaySnapshot(
  operation: OperationSnapshot,
  network: {
    stations: Station[];
    lines: RailLine[];
    segments: Segment[];
  } = {
    stations: fallbackStations,
    lines: fallbackLines,
    segments: fallbackSegments,
  },
): RailwaySnapshot {
  const viewLines: LineViewModel[] = network.lines.map((line) => {
    const lineIncident = operation.incidents.find(
      (incident) =>
        incident.scope.type === "line" && incident.scope.lineId === line.id,
    );

    const lineSegments: SegmentViewModel[] = network.segments
      .filter((segment) => segment.lineId === line.id)
      .map((segment) => {
        const segmentIncident =
          findSegmentIncident(segment, operation.incidents, network.lines) ??
          lineIncident;
        const status: RailStatus = segmentIncident?.status ?? "normal";

        return {
          ...segment,
          status,
          incident: segmentIncident,
        };
      });

    const mostSevereSegment = lineSegments.reduce<
      { status: RailStatus; incident?: Incident } | undefined
    >((current, segment) => {
      if (
        !current ||
        statusPriority[segment.status] > statusPriority[current.status]
      ) {
        return { status: segment.status, incident: segment.incident };
      }

      return current;
    }, undefined);

    return {
      ...line,
      status: lineIncident?.status ?? mostSevereSegment?.status ?? "normal",
      incident: lineIncident ?? mostSevereSegment?.incident,
      segments: lineSegments,
    };
  });
  const knownLineIds = new Set(network.lines.map((line) => line.id));
  const externalLines = operation.incidents
    .filter(
      (incident) =>
        incident.scope.type === "line" && !knownLineIds.has(incident.scope.lineId),
    )
    .map((incident): LineViewModel => {
      const line: RailLine = {
        id: incident.scope.lineId,
        name: incident.lineName ?? incident.affectedArea,
        operator: incident.operatorName ?? "External source",
        color: "#6b7280",
        stationIds: [],
        source: incident.source
          ? {
              provider: incident.source.provider,
              resourceType: incident.source.resourceType,
              raw: incident.source.raw,
            }
          : undefined,
      };

      return {
        ...line,
        status: incident.status,
        incident,
        segments: [],
      };
    });

  return {
    operation,
    generatedAt: new Date().toISOString(),
    stations: network.stations,
    lines: [...viewLines, ...externalLines],
  };
}

function findSegmentIncident(
  segment: Segment,
  incidents: Incident[],
  lines: RailLine[],
) {
  return incidents.find((incident) => {
    if (incident.scope.type !== "segment") {
      return false;
    }

    if (incident.scope.lineId !== segment.lineId) {
      return false;
    }

    return segmentFallsWithinIncidentScope(segment, incident, lines);
  });
}

function segmentFallsWithinIncidentScope(
  segment: Segment,
  incident: Incident,
  lines: RailLine[],
) {
  if (incident.scope.type !== "segment") {
    return false;
  }

  const line = lines.find((item) => item.id === incident.scope.lineId);

  if (!line) {
    return false;
  }

  const startIndex = line.stationIds.indexOf(incident.scope.fromStationId);
  const endIndex = line.stationIds.indexOf(incident.scope.toStationId);
  const fromIndex = line.stationIds.indexOf(segment.fromStationId);
  const toIndex = line.stationIds.indexOf(segment.toStationId);

  if ([startIndex, endIndex, fromIndex, toIndex].some((index) => index < 0)) {
    return false;
  }

  const lowerBound = Math.min(startIndex, endIndex);
  const upperBound = Math.max(startIndex, endIndex);

  return fromIndex >= lowerBound && toIndex <= upperBound;
}
