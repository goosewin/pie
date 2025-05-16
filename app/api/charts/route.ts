import * as schema from "@/db/schema";
import { charts, type ChartData } from "@/db/schema";
import { auth } from '@/lib/auth'; // Server-side auth instance
import { neon } from "@neondatabase/serverless";
import { Ratelimit } from "@upstash/ratelimit"; // For Upstash Redis
import { Redis } from "@upstash/redis"; // For Upstash Redis
import { drizzle } from "drizzle-orm/neon-http";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

// Initialize Drizzle client with Neon
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Initialize Upstash Redis and Ratelimiter
// Ensure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are in your .env.local
let redis: Redis | null = null;
let ratelimitInstance: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  ratelimitInstance = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 requests per 1 hour per IP
    analytics: true,
    /**
     * Optional prefix for the keys used in Redis.
     * This is useful if you want to share a Redis instance with other applications.
     */
    prefix: "@upstash/ratelimit:piechart",
  });
} else {
  console.warn(
    "Upstash Redis environment variables not found. Rate limiting will be disabled."
  );
}

// Define Zod schema for incoming chart data
const chartDataSchema = z.object({
  activities: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Activity name cannot be empty."),
      value: z.number().min(0, "Activity value cannot be negative."),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color format."),
    })
  ).min(1, "At least one activity is required."),
  mode: z.enum(['hours', 'percentage']),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting (AC-9)
    if (ratelimitInstance) {
      const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '127.0.0.1';
      const { success, limit, remaining, reset } = await ratelimitInstance.limit(ip);

      if (!success) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': limit.toString(),
              'X-RateLimit-Remaining': remaining.toString(),
              'X-RateLimit-Reset': new Date(reset).toISOString(),
            },
          }
        );
      }
    } else {
      console.warn("Rate limiting is disabled due to missing Upstash Redis config.");
    }

    // 2. Check Authentication
    const sessionData = await auth.api.getSession({ headers: req.headers });
    // Access user directly from the sessionData object if it exists
    const user = sessionData?.user;

    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized. User must be signed in to save charts.' }, { status: 401 });
    }

    // 3. Parse and Validate Request Body
    let rawBody;
    try {
      rawBody = await req.json();
    } catch (e) {
      console.error("Error in POST /api/charts:", e);
      return NextResponse.json({ error: 'Invalid request body. Expected JSON.' }, { status: 400 });
    }

    const validationResult = chartDataSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid chart data.', details: validationResult.error.flatten() }, { status: 400 });
    }
    const validatedChartData = validationResult.data as ChartData;

    // 4. Insert into Database
    const newChart = await db
      .insert(charts)
      .values({
        userId: user.id,
        chartData: validatedChartData,
      })
      .returning({ id: charts.id });

    if (!newChart || newChart.length === 0 || !newChart[0]?.id) {
      console.error("Failed to insert chart or retrieve ID:", newChart);
      return NextResponse.json({ error: 'Failed to save chart to database.' }, { status: 500 });
    }

    // 5. Return new chart's ID
    return NextResponse.json({ id: newChart[0].id }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/charts:", error);
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 
