import { RailDisruptionMap } from "@/components/rail-disruption-map";
import { getRailwaySnapshot, getScenarioList } from "@/lib/data-access";

export default function Home() {
  const scenarios = getScenarioList();
  const initialSnapshot = getRailwaySnapshot(scenarios[0].id);

  return (
    <main>
      <RailDisruptionMap
        initialSnapshot={initialSnapshot}
        scenarios={scenarios}
      />
    </main>
  );
}
