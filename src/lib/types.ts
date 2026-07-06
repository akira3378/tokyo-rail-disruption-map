import type {
  OdptRailwayRecord,
  OdptTrainInformationRecord,
} from "./sources/odpt/types";
import type { YahooTrainInformationRecord } from "./sources/yahoo/train-information";

export type RailStatus =
  "normal" | "delayed" | "suspended" | "reduced" | "unknown";

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

export type LineGeoPoint = {
  id: string;
  name: string;
  nameEn?: string;
  lat: number;
  lng: number;
  source: "osm-overpass";
};

export type LineGeoIndex = Record<string, LineGeoPoint>;

export type Segment = {
  id: string;
  lineId: string;
  fromStationId: string;
  toStationId: string;
};

export type RailLine = {
  id: string;
  name: string;
  nameEn?: string;
  operator: string;
  color: string;
  stationIds: string[];
  display?: {
    importance?: number;
  };
  source?: {
    provider: "odpt" | "yahoo";
    resourceType:
      "odpt:Railway" | "odpt:TrainInformation" | "yahoo:TrainInformation";
    raw:
      | OdptRailwayRecord
      | OdptTrainInformationRecord
      | YahooTrainInformationRecord;
  };
};

export type Incident = {
  id: string;
  status: Exclude<RailStatus, "normal">;
  title: string;
  lineName?: string;
  operatorName?: string;
  reason: string;
  scope: IncidentScope;
  affectedArea: string;
  updatedAt: string;
  note?: string;
  source?: {
    provider: "odpt" | "yahoo";
    resourceType: "odpt:TrainInformation" | "yahoo:TrainInformation";
    raw: OdptTrainInformationRecord | YahooTrainInformationRecord;
  };
};

export type OperationSnapshot = {
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
  operation: OperationSnapshot;
  generatedAt: string;
  stations: Station[];
  lineGeoIndex: LineGeoIndex;
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
