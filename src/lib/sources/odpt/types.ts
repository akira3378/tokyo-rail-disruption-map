/**
 * Shared localized text shape used by ODPT JSON-LD resources.
 *
 * Keep source types under `sources/odpt` so future Bus API or Airplane API
 * records can be added without leaking ODPT field names into UI components.
 */
export type OdptLocalizedText = {
  ja?: string;
  en?: string;
};

export type OdptResourceType =
  | "odpt:Operator"
  | "odpt:Railway"
  | "odpt:Station"
  | "odpt:TrainInformation"
  | "odpt:Bus"
  | "odpt:BusroutePattern"
  | "odpt:FlightInformationArrival"
  | "odpt:FlightInformationDeparture";

export type OdptBaseRecord<TType extends OdptResourceType> = {
  "@context": string;
  "@id": string;
  "@type": TType;
  "owl:sameAs": string;
  "dc:date"?: string;
  "dct:valid"?: string;
};

/**
 * ODPT Train API: operation notices for a railway/operator.
 *
 * This is the only live resource currently mapped into the UI. Static railway
 * and station records are imported for future network expansion, while Bus and
 * Airplane resources should get their own mapper modules later.
 */
export type OdptTrainInformationRecord =
  OdptBaseRecord<"odpt:TrainInformation"> & {
    "dc:date": string;
    "odpt:operator": string;
    "odpt:railway": string;
    "odpt:railwayTitle"?: OdptLocalizedText;
    "odpt:timeOfOrigin"?: string;
    "odpt:trainInformationStatus"?: OdptLocalizedText;
    "odpt:trainInformationCause"?: OdptLocalizedText;
    "odpt:trainInformationRange"?: OdptLocalizedText;
    "odpt:trainInformationText"?: OdptLocalizedText;
  };

export type OdptStationOrder = {
  "odpt:index": number;
  "odpt:station": string;
  "odpt:stationTitle"?: OdptLocalizedText;
};

export type OdptRailwayRecord = OdptBaseRecord<"odpt:Railway"> & {
  "dc:title"?: string;
  "odpt:operator": string;
  "odpt:railwayTitle"?: OdptLocalizedText;
  "odpt:color"?: string;
  "odpt:stationOrder"?: OdptStationOrder[];
};
