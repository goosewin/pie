"use client";

import { AuthStatus } from "@/components/auth-status"; // Import AuthStatus component
import { ChartLegendComponent } from "@/components/chart-legend"; // Import the legend
import { InputForm } from '@/components/input-form'; // Import the new form
import { PieChartComponent } from "@/components/pie-chart"; // Import the chart
import { ProgressBarComponent } from "@/components/progress-bar"; // Import the progress bar
import { ThemeToggle } from "@/components/theme-toggle"; // Import the toggle
import { Button } from '@/components/ui/button'; // Placeholder for later use
import { Input } from "@/components/ui/input"; // For displaying share URL
import type { ChartData } from '@/db/schema'; // Added for type safety
import { authClient } from '@/lib/auth-client'; // Added for auth
import { serializeActivities } from "@/lib/encoding"; // Import serialization function
import type { Activity, InputMode } from '@/types';
import { track } from "@vercel/analytics/react"; // Import track
import { Copy, Share2 } from "lucide-react"; // For new buttons
import { useState } from 'react';

// Define APP_URL - should ideally come from environment variables
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Helper to generate unique IDs for new activities
const generateId = () => Date.now().toString();

const defaultActivities: Activity[] = [
  {
    id: generateId(),
    name: "Sleep",
    value: 56,
    color: "#3498db", // A pleasant blue
  },
];

export default function HomePage() {
  const [activities, setActivities] = useState<Activity[]>(defaultActivities);
  const [inputMode, setInputMode] = useState<InputMode>("hours");
  const [shareUrl, setShareUrl] = useState<string | null>(null); // State for the generated share URL
  const [isSavingChart, setIsSavingChart] = useState<boolean>(false); // Added for loading state
  const { data: sessionData, isPending: isSessionPending } = authClient.useSession(); // Corrected session handling

  const toggleInputMode = () => {
    const newMode = inputMode === "hours" ? "percentage" : "hours";
    const totalHoursInWeek = 168;

    const convertedActivities = activities.map(act => {
      let newValue;
      if (newMode === "percentage") {
        // Hours to Percentage
        newValue = (act.value / totalHoursInWeek) * 100;
      } else {
        // Percentage to Hours
        newValue = (act.value / 100) * totalHoursInWeek;
      }
      // PRD 5.1: decimals allowed ( ≤ 1 decimal)
      newValue = Math.round(newValue * 10) / 10;
      return { ...act, value: newValue };
    });

    setActivities(convertedActivities); // Update activities with new values
    setInputMode(newMode); // Update the mode
    track("mode_switch", { new_mode: newMode });
  };

  // Calculate total and max for validation message
  const currentTotal = activities.reduce((sum, act) => sum + (act.value || 0), 0);
  const maxTotal = inputMode === "hours" ? 168 : 100;
  let validationMessage = "";
  if (currentTotal > maxTotal) {
    validationMessage = `Total exceeds ${maxTotal}${inputMode === "hours" ? "h" : "%"}. Please adjust your activities.`;
  }

  const handleGenerateAndShowShareables = async () => {
    setIsSavingChart(true);
    if (!isSessionPending && sessionData?.user) {
      try {
        const chartPayload: ChartData = {
          activities: activities,
          mode: inputMode, // Corrected field name to 'mode'
        };
        const response = await fetch('/api/charts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chartPayload),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.id) {
            const url = `${APP_URL}/share/${result.id}`;
            setShareUrl(url);
          } else {
            console.error("Failed to save chart: No ID received.", result);
            setShareUrl(null); // Or handle error more gracefully
            // alert("Failed to save chart. Please try again.");
          }
        } else {
          const errorData = await response.json();
          console.error("Failed to save chart:", response.status, errorData);
          setShareUrl(null);
          // alert(`Failed to save chart: ${errorData.error || response.statusText}`);
        }
      } catch (error) {
        console.error("Error saving chart:", error);
        setShareUrl(null);
        // alert("An unexpected error occurred while saving your chart.");
      }
    } else {
      // Fallback for unauthenticated users
      const encodedData = serializeActivities(activities);
      if (encodedData) {
        const url = `${APP_URL}/share/${encodedData}`;
        setShareUrl(url);
      } else {
        console.error("Failed to generate share link.");
        setShareUrl(null);
        // alert("Could not generate share link. Please try again.");
      }
    }
    setIsSavingChart(false);
  };

  const handleCopyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        // alert("Link copied to clipboard!"); // Consider a toast for success
        track("share_click", { type: "copy_link", url: shareUrl });
        console.log("Link copied!");
      }).catch(err => {
        console.error("Failed to copy link: ", err);
        // alert("Failed to copy link.");
      });
    }
  };

  const handleShareOnX = () => {
    if (shareUrl) {
      const text = encodeURIComponent(`Here\'s how I spend my week ⬇️ Make yours ➡️ ${APP_URL}`);
      const url = encodeURIComponent(shareUrl);
      const xIntentUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      track("share_click", { type: "share_on_x", url: shareUrl });
      window.open(xIntentUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <main className="flex flex-col items-center min-h-screen">
      <div className="relative w-full max-w-5xl">
        <header className="flex justify-between my-8 text-left"> {/* Changed to text-left, adjusted top padding */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"> {/* Reduced font size */}
              PIE.GOOSEWIN.COM
            </h1>
          </div>
          <div>
            <div className="z-20 flex items-center space-x-2">
              <AuthStatus />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main content area for form and chart */}
        <div className="flex flex-col gap-6 md:flex-row lg:gap-8">
          {/* Input Form Section */}
          <section id="input-form-section" className="flex-shrink-0 order-2 w-full p-6 border-2 md:w-2/5 lg:w-1/3 md:order-1 bg-card border-foreground"> {/* Neobrutalist container */}
            <h2 className="mb-6 text-2xl font-bold text-center md:text-left">Your Activities</h2> {/* Bold and centered on mobile */}
            <InputForm
              activities={activities}
              setActivities={setActivities}
              inputMode={inputMode}
              setInputMode={setInputMode}
            />
          </section>

          {/* Chart and Legend Section */}
          <section id="chart-section" className="order-1 w-full p-6 border-2 md:w-3/5 lg:w-2/3 md:order-2 bg-card border-foreground"> {/* Neobrutalist container */}
            <div className="flex items-center justify-between mb-6"> {/* Flex container for title and button */}
              <h2 className="text-2xl font-bold text-center md:text-right">Your Week</h2> {/* Adjusted alignment */}
              <Button
                onClick={toggleInputMode}
                variant="default" /* Or choose another variant like outline if preferred */
                className="!font-semibold border-2 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] hover:shadow-[2px_2px_0px_0px_var(--foreground)] transition-shadow duration-150 ease-in-out"
              >
                Switch to {inputMode === "hours" ? "Percentage" : "Hours"}
              </Button>
            </div>
            <div className="md:sticky md:top-8"> {/* Sticky only on medium screens and up */}
              <PieChartComponent activities={activities} inputMode={inputMode} />
              <div className="mt-6"> {/* Increased margin for legend */}
                <ChartLegendComponent activities={activities} />
              </div>
            </div>
          </section>
        </div>

        {/* Progress Bar below both sections */}
        <div className="p-6 mt-6 border-2 lg:mt-8 bg-card border-foreground"> {/* Neobrutalist container */}
          <ProgressBarComponent activities={activities} inputMode={inputMode} />
          {validationMessage && (
            <p className="mt-3 text-sm font-medium text-center text-destructive"> {/* Use destructive for errors, increased margin */}
              {validationMessage}
            </p>
          )}
        </div>

        {/* Share Section - shows after link is generated */}
        {shareUrl ? (
          <div className="p-6 mt-6 space-y-4 text-center border-2 lg:mt-8 border-foreground bg-card"> {/* Neobrutalist container */}
            <h3 className="mb-3 text-xl font-bold">Your Shareable Link is Ready!</h3> {/* Bold h3 */}
            <div className="flex items-center space-x-2">
              <Input type="text" value={shareUrl} readOnly className="flex-grow !border-foreground/50 focus:!border-primary" /> {/* Ensure input fits theme */}
              <Button variant="outline" onClick={handleCopyToClipboard} className="p-0 border-2 h-11 w-11 border-foreground hover:bg-accent" aria-label="Copy link">
                <Copy className="w-5 h-5" />
              </Button>
            </div>
            <Button size="lg" onClick={handleShareOnX} className="w-full md:w-auto !font-bold" variant="default"> {/* Ensure primary button style, bold text */}
              <Share2 className="w-5 h-5 mr-2" /> Share on X
            </Button>
            {/* Optional: Display OG image preview if desired */}
            {/* <img src={`/api/og?data=${encodeURIComponent(activitiesToShare)}`} alt="OG Preview" className="mt-4 border rounded" /> */}
          </div>
        ) : (
          <div className="fixed bottom-0 left-0 right-0 z-30 p-4 border-t-2 border-foreground bg-background md:static md:z-auto md:border-none md:bg-transparent md:p-0 md:text-center md:mt-8"> {/* Neobrutalist sticky CTA */}
            <div className="max-w-md mx-auto md:max-w-none"> {/* Limit width on mobile for the button */}
              <Button size="lg" onClick={handleGenerateAndShowShareables} className="w-full !font-bold" disabled={isSavingChart} variant="default"> {/* Ensure primary button style, bold text */}
                {isSavingChart ? "Saving..." : "Generate Share Link"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
