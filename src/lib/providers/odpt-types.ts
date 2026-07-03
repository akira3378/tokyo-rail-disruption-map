import type { IncidentScope, RailStatus } from "../types";

export type OdptLocalizedText = {
  ja?: string;
  en?: string;
};

export type OdptTrainInformationRecord = {
  "@context": string;
  "@id": string;
  "@type": "odpt:TrainInformation";
  "owl:sameAs": string;
  "dc:date": string;
  "dct:valid"?: string;
  "odpt:operator": string;
  "odpt:railway": string;
  "odpt:railwayTitle"?: OdptLocalizedText;
  "odpt:timeOfOrigin"?: string;
  "odpt:trainInformationStatus"?: OdptLocalizedText;
  "odpt:trainInformationCause"?: OdptLocalizedText;
  "odpt:trainInformationRange"?: OdptLocalizedText;
  "odpt:trainInformationText"?: OdptLocalizedText;
};

export type OdptIncidentResolution = {
  status: Exclude<RailStatus, "normal">;
  scope: IncidentScope;
  affectedArea: string;
};
