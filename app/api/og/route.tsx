import { deserializeActivities } from '@/lib/encoding'; // Assuming deserializer is here
import type { Activity } from '@/types';
import { ImageResponse } from '@vercel/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge'; // Vercel OG requires Edge runtime

// Helper function to fetch font data (example)
/*
async function getFontData(fontName: string, _weight: number, _style: string) {
  // In a real scenario, you'd fetch the font file from a URL or local path
  // For example, fetching Inter font:
  // const response = await fetch(`https://rsms.me/inter/font-files/Inter-${fontName}-Regular.woff`); // Simplified example name
  // if (!response.ok) throw new Error('Failed to fetch font');
  // return response.arrayBuffer();

  // Placeholder: In a real app, load your font file (e.g., .ttf, .woff2)
  // For now, returning null to avoid breaking if the font isn't immediately available.
  // Satori will use a default system font if no font data is provided.
  console.warn(`Font data for ${fontName} not loaded. Satori will use a default system font.`);
  return null; // Placeholder
}
*/

// Simplified component to render chart for OG image using basic elements
// Satori (used by @vercel/og) has limitations on CSS and component usage
// Cannot use complex libraries like Recharts directly here easily
function OgChartComponent({ activities, appUrl }: { activities: Activity[]; appUrl: string }) {
  const totalValue = activities.reduce((sum, act) => sum + (act.value || 0), 0);

  const chartSize = 300; // Diameter of the pie chart
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const radius = chartSize / 2;

  let startAngle = -90; // Start from the top
  const labels: React.JSX.Element[] = [];

  const paths = activities.map(activity => {
    if (!activity.value || totalValue === 0) {
      return null;
    }
    const percentage = (activity.value / totalValue);
    const angle = percentage * 360;
    const endAngle = startAngle + angle;

    // For slices >= 5%, add a label
    if (percentage * 100 >= 5) {
      const midAngle = startAngle + angle / 2;
      const labelRadius = radius * 0.7; // Position label inside the slice for simplicity with Satori
      const labelX = centerX + labelRadius * Math.cos(Math.PI * midAngle / 180);
      const labelY = centerY + labelRadius * Math.sin(Math.PI * midAngle / 180);
      labels.push(
        <text
          key={`label-${activity.id}`}
          x={labelX}
          y={labelY}
          fill="#FFFFFF" // White text, assuming dark slices. Could be dynamic based on slice color.
          fontSize="12"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {`${(percentage * 100).toFixed(0)}%`}
        </text>
      );
    }

    const x1 = centerX + radius * Math.cos(Math.PI * startAngle / 180);
    const y1 = centerY + radius * Math.sin(Math.PI * startAngle / 180);
    const x2 = centerX + radius * Math.cos(Math.PI * endAngle / 180);
    const y2 = centerY + radius * Math.sin(Math.PI * endAngle / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const d = [
      `M ${centerX},${centerY}`, // Move to center
      `L ${x1},${y1}`,           // Line to start of arc
      `A ${radius},${radius} 0 ${largeArcFlag} 1 ${x2},${y2}`, // Arc
      `Z`                       // Close path (back to center)
    ].join(' ');

    startAngle = endAngle;

    return <path key={activity.id} d={d} fill={activity.color} />;
  }).filter(Boolean);


  return (
    <div // Outer container
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-around', // Adjusted for better spacing with legend
        backgroundColor: '#222222', // Darker background
        color: '#FFFFFF',
        padding: '40px', // Reduced padding a bit
        fontFamily: 'sans-serif', // Generic font family
      }}
    >
      <div style={{ fontSize: '42px', fontWeight: 'bold', color: '#EEEEEE', textAlign: 'center' }}>How I Spend My Week</div>

      {activities.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 }}>
          <svg width={chartSize} height={chartSize} viewBox={`0 0 ${chartSize} ${chartSize}`} style={{ marginBottom: '20px' }}>
            {paths}
            {labels} { /* Render labels on top of paths */}
          </svg>
          <div // Legend container
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px 20px', // Row and column gap
              maxWidth: '80%',
            }}
          >
            {activities.map(activity => {
              if (!activity.value || totalValue === 0) return null;
              const percentage = ((activity.value / totalValue) * 100).toFixed(1);
              return (
                <div key={activity.id} style={{ display: 'flex', alignItems: 'center', fontSize: '18px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: activity.color, marginRight: '8px', borderRadius: '3px' }} />
                  <span style={{ color: '#DDDDDD' }}>{activity.name}: </span>
                  <span style={{ color: '#CCCCCC', marginLeft: '4px' }}>{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: '32px', color: '#AAAAAA' }}>No activities to display</div>
      )}

      <div style={{ fontSize: '28px', color: '#DDDDDD' }}>
        Create your own: {appUrl}
      </div>
    </div>
  );
}

async function fetchActivities(dataParam: string, appUrl: string): Promise<Activity[] | null> {
  const numericId = parseInt(dataParam, 10);

  if (!isNaN(numericId)) {
    // It's a numeric ID, fetch from API
    try {
      // Note: Fetching from an absolute URL (our own API) within an API route.
      // Ensure this is allowed and configured correctly in Vercel environment.
      // Consider direct DB access if this route can securely access DB credentials and Drizzle.
      // For now, following the pattern of fetching from the GET /api/charts/[id] endpoint.
      const res = await fetch(`${appUrl}/api/charts/${numericId}`);
      if (!res.ok) {
        console.error(`OG: Failed to fetch chart by ID ${numericId}: ${res.status}`);
        return null;
      }
      const data = await res.json();
      // API returns { id, chartData: { activities, mode }, createdAt }
      if (data && data.chartData && data.chartData.activities) {
        return data.chartData.activities as Activity[];
      } else {
        console.error("OG: Invalid chart data structure from API for ID", numericId);
        return null;
      }
    } catch (e) {
      console.error(`OG: Error fetching chart by ID ${numericId}:`, e);
      return null;
    }
  } else {
    // It's an encoded string, try to deserialize
    try {
      const deserialized = deserializeActivities(dataParam);
      return deserialized; // deserializeActivities now returns Activity[] | null
    } catch (e) {
      console.error(`OG: Error deserializing data:`, e);
      return null;
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataParam = searchParams.get('data');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!dataParam) {
    return new Response('Missing data parameter', { status: 400 });
  }

  try {
    const activities = await fetchActivities(dataParam, appUrl);

    if (!activities) {
      // Consider returning a default OG image or a more specific error image
      return new Response('Failed to load chart data for OG image', { status: 500 });
    }

    const imageWidth = 1200;
    const imageHeight = 630;

    return new ImageResponse(
      (
        <OgChartComponent activities={activities} appUrl={appUrl} />
      ),
      {
        width: imageWidth,
        height: imageHeight,
        // fonts: [
        //   {
        //     name: 'Inter', // Example font
        //     data: await getFontData('Inter', 400, 'normal'), // Call with font name, weight, style
        //     weight: 400,
        //     style: 'normal',
        //   },
        // ],
        // TODO: Add font loading (e.g., Inter) if needed for Satori for consistency
      },
    );
  } catch (error: unknown) {
    console.error('Failed to generate OG image:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(`Failed to generate image: ${message}`, {
      status: 500,
    });
  }
}
