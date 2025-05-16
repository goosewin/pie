// No "use client" here - this is a Server Component

import { SharePageClient } from '@/components/share-page-client'; // Import the new client component
import { deserializeActivities } from "@/lib/encoding"; // Import for decoding
import type { Activity, InputMode } from "@/types";
import type { Metadata } from 'next';

// Define APP_URL - should ideally come from environment variables
// Ensure NEXT_PUBLIC_APP_URL is set in your .env or Vercel environment
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SharePageProps {
  params: { id: string };
}

interface ChartPageData {
  activities: Activity[];
  mode: InputMode;
  error?: string;
  idForOg?: string | number; // To pass to OG image generator
}

async function getChartData(idParam: string): Promise<ChartPageData> {
  const numericId = parseInt(idParam, 10);
  let idForOg: string | number = idParam;

  if (!isNaN(numericId)) {
    // It's a numeric ID, fetch from API
    idForOg = numericId;
    try {
      const res = await fetch(`${APP_URL}/api/charts/${numericId}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { activities: [], mode: "hours", error: errorData.error || `Error fetching chart: ${res.statusText}`, idForOg };
      }
      const data = await res.json();
      // The API returns { id, chartData: { activities, mode }, createdAt }
      // We need to extract activities and mode from chartData
      if (data && data.chartData && data.chartData.activities && data.chartData.mode) {
        return { activities: data.chartData.activities, mode: data.chartData.mode, idForOg };
      } else {
        return { activities: [], mode: "hours", error: "Invalid chart data structure from API.", idForOg };
      }
    } catch (e) {
      console.error("Failed to fetch chart by ID:", e);
      return { activities: [], mode: "hours", error: "Failed to connect to API.", idForOg };
    }
  } else {
    // It's an encoded string, try to deserialize
    try {
      const deserializedActivities = deserializeActivities(idParam); // Now returns Activity[] | null
      if (deserializedActivities) {
        // deserializedActivities is now correctly typed as Activity[] here.
        // Mode is not in V1 encoded data, so default to "hours".
        return { activities: deserializedActivities, mode: "hours" as InputMode, idForOg };
      } else {
        return { activities: [], mode: "hours" as InputMode, error: "Invalid share link data.", idForOg };
      }
    } catch (e) {
      console.error("Failed to deserialize chart data:", e);
      return { activities: [], mode: "hours" as InputMode, error: "Invalid share link format.", idForOg };
    }
  }
}

// generateMetadata function remains here (Server Component feature)
export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const chartPageData = await getChartData(params.id);
  const ogDataParam = chartPageData.idForOg || params.id;

  const title = "My Weekly Allocation";
  const description = `Check out how I spend my week! Create your own personalized chart: ${APP_URL}`;
  const ogImageUrl = `${APP_URL}/api/og?data=${encodeURIComponent(ogDataParam.toString())}`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: 'Weekly time allocation chart',
        },
      ],
      type: 'website',
      url: `${APP_URL}/share/${params.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [ogImageUrl],
    },
  };
}

// The Page component itself is now a Server Component
export default async function SharePage({ params }: SharePageProps) {
  const chartDataResult = await getChartData(params.id);

  // Optional: Add basic server-side validation for encodedData if needed
  // e.g., check length or basic format before passing to client
  // The getChartData function now handles basic validation and fetching/deserializing
  // if (typeof encodedData !== 'string' || encodedData.length === 0 || encodedData.length > 4000) { // Basic checks
  //   // Handle invalid ID format on the server - maybe render an error page or redirect
  //   // For now, we can let the client component handle a potentially invalid string
  //   // or return a specific error component from the server.
  //   // Let's render the client component but it will likely show an error.
  // }

  // Render the Client Component and pass the data
  // SharePageClient will need to accept activities, mode, and an optional error.
  return <SharePageClient initialActivities={chartDataResult.activities} initialMode={chartDataResult.mode} error={chartDataResult.error} />;
} 
