import { demoScenarios } from "./demo-scenarios";
import { lines, segments, stations } from "./rail-network";
import type {
  DemoScenario,
  Incident,
  LineViewModel,
  RailStatus,
  RailwaySnapshot,
  Segment,
  SegmentViewModel,
} from "./types";

const statusPriority: Record<RailStatus, number> = {
  normal: 0,
  unknown: 1,
  reduced: 2,
  delayed: 3,
  suspended: 4,
};

export function getScenarioList(): DemoScenario[] {
  return demoScenarios;
}

export function getRailwaySnapshot(scenarioId: string): RailwaySnapshot {
  const scenario =
    demoScenarios.find((item) => item.id === scenarioId) ?? demoScenarios[0];

  const viewLines: LineViewModel[] = lines.map((line) => {
    const lineIncident = scenario.incidents.find(
      (incident) =>
        incident.scope.type === "line" && incident.scope.lineId === line.id,
    );

    const lineSegments: SegmentViewModel[] = segments
      .filter((segment) => segment.lineId === line.id)
      .map((segment) => {
        const segmentIncident =
          findSegmentIncident(segment, scenario.incidents) ?? lineIncident;
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

  return {
    scenario,
    generatedAt: new Date().toISOString(),
    stations,
    lines: viewLines,
  };
}

function findSegmentIncident(segment: Segment, incidents: Incident[]) {
  return incidents.find((incident) => {
    if (incident.scope.type !== "segment") {
      return false;
    }

    if (incident.scope.lineId !== segment.lineId) {
      return false;
    }

    return segmentFallsWithinIncidentScope(segment, incident);
  });
}

function segmentFallsWithinIncidentScope(segment: Segment, incident: Incident) {
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
