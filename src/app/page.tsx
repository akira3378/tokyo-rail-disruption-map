import { RailDisruptionMap } from "@/components/rail-disruption-map";
import { getInitialRailwaySnapshot } from "@/lib/data-access";

export default function Home() {
  const initialSnapshot = getInitialRailwaySnapshot();

  return (
    <main>
      <RailDisruptionMap initialSnapshot={initialSnapshot} />
    </main>
  );
}
