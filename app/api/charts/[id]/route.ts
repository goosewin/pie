import * as schema from "@/db/schema";
import { charts } from "@/db/schema";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { NextResponse, type NextRequest } from "next/server";

// Initialize Drizzle client with Neon
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid chart ID format. Expected a number." }, { status: 400 });
  }

  try {
    const chartData = await db
      .select({
        id: charts.id,
        chartData: charts.chartData,
        createdAt: charts.createdAt,
        // userId: charts.userId, // Include if you want to return it
        // guestIdentifier: charts.guestIdentifier, // Include if you want to return it
      })
      .from(charts)
      .where(eq(charts.id, id))
      .limit(1);

    if (!chartData || chartData.length === 0) {
      return NextResponse.json({ error: "Chart not found" }, { status: 404 });
    }

    // The actual chart data is in the chartData.chartData field based on your schema
    return NextResponse.json(chartData[0], { status: 200 });

  } catch (error) {
    console.error(`Error fetching chart with id ${id}:`, error);
    if (error instanceof Error && error.message.includes("authentication failed")) {
      return NextResponse.json({ error: "Database authentication failed. Check DATABASE_URL." }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
} 
