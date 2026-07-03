import { RailDisruptionMap } from "@/components/rail-disruption-map";
import { getRailwaySnapshotsByScenario, getScenarioList } from "@/lib/data-access";

export default function Home() {
  const scenarios = getScenarioList();
  const snapshotsByScenario = getRailwaySnapshotsByScenario();
  const initialSnapshot = snapshotsByScenario[scenarios[0].id];

  return (
    <main>
      <RailDisruptionMap
        initialSnapshot={initialSnapshot}
        snapshotsByScenario={snapshotsByScenario}
        scenarios={scenarios}
      />
    </main>
  );
}
