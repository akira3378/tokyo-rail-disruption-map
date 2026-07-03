import { NextResponse } from "next/server";
import {
  getOdptLiveRailwaySnapshot,
  ODPT_REVALIDATE_SECONDS,
} from "@/lib/providers/odpt-live-provider";

export const revalidate = 60;

export async function GET() {
  try {
    const snapshot = await getOdptLiveRailwaySnapshot();

    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": `s-maxage=${ODPT_REVALIDATE_SECONDS}, stale-while-revalidate=${ODPT_REVALIDATE_SECONDS * 2}`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load ODPT TrainInformation.",
      },
      { status: 503 },
    );
  }
}
