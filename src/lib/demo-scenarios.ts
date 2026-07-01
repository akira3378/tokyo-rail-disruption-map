import {
  odptIncidentResolutionBySameAs,
  odptMockTrainInformationScenarios,
} from "./providers/odpt-mock-train-information";
import { normalizeOdptMockScenarios } from "./providers/odpt-normalizer";

export const demoScenarios = normalizeOdptMockScenarios(
  odptMockTrainInformationScenarios,
  odptIncidentResolutionBySameAs,
);
