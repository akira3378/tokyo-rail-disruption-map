export type RailStatus =
  | "normal"
  | "delayed"
  | "suspended"
  | "reduced"
  | "unknown";

export type IncidentScope =
  | {
      type: "line";
      lineId: string;
    }
  | {
      type: "segment";
      lineId: string;
      fromStationId: string;
      toStationId: string;
    };

export type Station = {
  id: string;
  name: string;
  nameEn: string;
  x: number;
  y: number;
  display?: {
    isMajor?: boolean;
    isTransfer?: boolean;
    priority?: number;
  };
};

export type Segment = {
  id: string;
  lineId: string;
  fromStationId: string;
  toStationId: string;
};

export type RailLine = {
  id: string;
  name: string;
  operator: string;
  color: string;
  stationIds: string[];
  display?: {
    importance?: number;
  };
};

export type Incident = {
  id: string;
  status: Exclude<RailStatus, "normal">;
  title: string;
  reason: string;
  scope: IncidentScope;
  affectedArea: string;
  updatedAt: string;
  note?: string;
};

export type DemoScenario = {
  id: string;
  name: string;
  description: string;
  incidents: Incident[];
};

export type SegmentViewModel = Segment & {
  status: RailStatus;
  incident?: Incident;
};

export type LineViewModel = RailLine & {
  status: RailStatus;
  incident?: Incident;
  segments: SegmentViewModel[];
};

export type RailwaySnapshot = {
  scenario: DemoScenario;
  generatedAt: string;
  stations: Station[];
  lines: LineViewModel[];
};

export type Selection =
  | {
      type: "line";
      lineId: string;
    }
  | {
      type: "segment";
      segmentId: string;
      lineId: string;
    };
