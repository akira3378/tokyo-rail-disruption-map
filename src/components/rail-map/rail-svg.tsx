import { statusStrokeClasses } from "@/lib/status";
import type {
  LineViewModel,
  RailStatus,
  Selection,
  SegmentViewModel,
  Station,
} from "@/lib/types";
import { MAP_HEIGHT, MAP_WIDTH } from "@/lib/map/constants";

type RailSvgProps = {
  ariaLabel: string;
  lines: LineViewModel[];
  stations: Station[];
  stationById: Map<string, Station>;
  selection: Selection | null;
  hoveredSegmentId: string | null;
  statusText: Record<RailStatus, { label: string; description: string }>;
  zoom: number;
  onSelectSegment: (segmentId: string, lineId: string) => void;
  onHover: (segmentId: string | null) => void;
};

export function RailSvg({
  ariaLabel,
  lines,
  stations,
  stationById,
  selection,
  hoveredSegmentId,
  statusText,
  zoom,
  onSelectSegment,
  onHover,
}: RailSvgProps) {
  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      className="block"
      style={{
        width: `${MAP_WIDTH}px`,
        height: `${MAP_HEIGHT}px`,
        transform: `scale(${zoom})`,
        transformOrigin: "top left",
      }}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
    >
      <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="var(--map-bg)" />
      <g opacity="0.42">
        {Array.from({ length: 10 }).map((_, index) => (
          <line
            key={`h-${index}`}
            x1="40"
            x2="900"
            y1={80 + index * 65}
            y2={80 + index * 65}
            stroke="var(--map-grid)"
            strokeWidth="1"
          />
        ))}
        {Array.from({ length: 9 }).map((_, index) => (
          <line
            key={`v-${index}`}
            x1={80 + index * 100}
            x2={80 + index * 100}
            y1="50"
            y2="720"
            stroke="var(--map-grid)"
            strokeWidth="1"
          />
        ))}
      </g>

      {lines.map((line) => (
        <g key={line.id}>
          {line.segments.map((segment) => (
            <RailSegment
              key={segment.id}
              line={line}
              segment={segment}
              stationById={stationById}
              selected={
                (selection?.type === "segment" &&
                  selection.segmentId === segment.id) ||
                (selection?.type === "line" && selection.lineId === line.id)
              }
              hovered={hoveredSegmentId === segment.id}
              statusText={statusText}
              onSelectSegment={onSelectSegment}
              onHover={onHover}
            />
          ))}
        </g>
      ))}

      {stations.map((station) => (
        <g key={station.id}>
          <circle
            cx={station.x}
            cy={station.y}
            r="5.5"
            fill="var(--station-fill)"
            stroke="var(--station-stroke)"
            strokeWidth="2"
          />
          <text
            x={station.x + 9}
            y={station.y - 9}
            className="select-none fill-[var(--map-label)] text-[12px] font-semibold"
          >
            {station.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

function RailSegment({
  line,
  segment,
  stationById,
  selected,
  hovered,
  statusText,
  onSelectSegment,
  onHover,
}: {
  line: LineViewModel;
  segment: SegmentViewModel;
  stationById: Map<string, Station>;
  selected: boolean;
  hovered: boolean;
  statusText: Record<RailStatus, { label: string; description: string }>;
  onSelectSegment: (segmentId: string, lineId: string) => void;
  onHover: (segmentId: string | null) => void;
}) {
  const from = stationById.get(segment.fromStationId);
  const to = stationById.get(segment.toStationId);

  if (!from || !to) {
    return null;
  }

  const isNormal = segment.status === "normal";
  const isDisrupted = !isNormal;
  const strokeClass = isNormal ? "" : statusStrokeClasses[segment.status];
  const segmentLabel = `${line.name}: ${from.name} - ${to.name} / ${
    segment.incident?.title ?? statusText[segment.status].description
  }`;

  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={line.color}
        strokeLinecap="round"
        strokeWidth={selected || hovered ? 15 : 11}
        opacity={isDisrupted ? 0.26 : selected || hovered ? 0.2 : 0}
        pointerEvents="none"
      />
      {isDisrupted ? (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth={selected || hovered ? 18 : 15}
          className={`${strokeClass} rail-alert-halo`}
          pointerEvents="none"
        />
      ) : null}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke="transparent"
        strokeWidth="26"
        aria-label={segmentLabel}
        className="cursor-pointer"
        onMouseEnter={() => onHover(segment.id)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onSelectSegment(segment.id, line.id)}
      />
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={isNormal ? line.color : undefined}
        strokeLinecap="round"
        strokeWidth={selected ? 12 : hovered ? 10 : isNormal ? 7 : 10}
        aria-hidden="true"
        className={`${strokeClass} cursor-pointer transition-all ${
          isDisrupted ? "rail-alert-blink" : ""
        }`}
        opacity={isNormal ? 0.86 : 1}
        onMouseEnter={() => onHover(segment.id)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onSelectSegment(segment.id, line.id)}
      />
      {segment.status === "suspended" ? (
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="#ffffff"
          strokeLinecap="round"
          strokeWidth="2.5"
          opacity="0.85"
          pointerEvents="none"
        />
      ) : null}
    </g>
  );
}
