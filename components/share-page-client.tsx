"use client";

import { ChartLegendComponent } from "@/components/chart-legend";
import { InterestingFactsComponent } from "@/components/interesting-facts";
import { PieChartComponent } from "@/components/pie-chart";
import { Button } from "@/components/ui/button";
// import { deserializeActivities } from "@/lib/encoding"; // No longer needed here
import { generateFacts, type Fact } from "@/lib/facts";
import type { Activity, InputMode } from "@/types";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface SharePageClientProps {
  initialActivities: Activity[];
  initialMode: InputMode;
  error?: string; // Optional error message from server
}

export function SharePageClient({ initialActivities, initialMode, error: initialError }: SharePageClientProps) {
  const [activitiesForDisplay, setActivitiesForDisplay] = useState<Activity[]>([]);
  const [currentMode, setCurrentMode] = useState<InputMode>('hours');
  const [facts, setFacts] = useState<Fact[]>([]);
  const [displayError, setDisplayError] = useState<string | null>(null);

  useEffect(() => {
    if (initialError) {
      setDisplayError(initialError);
      setActivitiesForDisplay([]); // Clear activities if there's an error
      return;
    }

    if (initialActivities && initialActivities.length > 0) {
      setActivitiesForDisplay(initialActivities);
      setCurrentMode(initialMode);

      let factsToSet: Fact[];
      // Fact generation needs to be careful about mode.
      // If initialMode is percentage, facts should be calculated based on converted-to-hours values.
      // generateFacts expects hours.
      if (initialMode === 'percentage') {
        const totalPercentage = initialActivities.reduce((sum, act) => sum + (act.value || 0), 0);
        // Ensure total percentage is somewhat reasonable before converting, to avoid massive hour values if data is corrupt.
        // And ensure the sum does not exceed typical percentage total (e.g. 100, maybe a bit more for rounding)
        if (totalPercentage > 0 && totalPercentage < 110) { // Heuristic check
          const convertedForFacts = initialActivities.map(act => ({
            ...act,
            // Convert percentage to hours based on a 168-hour week for fact generation
            value: Math.round(((act.value || 0) / 100) * 168 * 10) / 10,
          }));
          factsToSet = generateFacts(convertedForFacts);
        } else {
          // If percentage values are abnormal, generate facts on raw values assuming they might be hours
          // or provide a specific message. For now, generate with raw assuming hours.
          factsToSet = generateFacts(initialActivities);
        }
      } else { // initialMode is 'hours'
        factsToSet = generateFacts(initialActivities);
      }
      setFacts(factsToSet);
      setDisplayError(null);
    } else if (!initialError) { // No activities and no initial error
      setDisplayError("No chart data found or data is empty.");
      setActivitiesForDisplay([]);
    }
  }, [initialActivities, initialMode, initialError]);

  if (displayError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Chart Error</CardTitle>
            <CardDescription>{displayError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Create Your Own Chart</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (activitiesForDisplay.length === 0 && !displayError) {
    // Still loading or no activities valid after processing (and no explicit error set by effect)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <p>Loading chart data...</p> {/* TODO: Add a spinner */}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <header className="my-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Shared Weekly Allocation
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s a breakdown of a week. Want to create your own?
        </p>
      </header>

      <div className="flex flex-col items-start gap-8 lg:flex-row">
        <section className="order-1 w-full lg:w-3/5 lg:sticky lg:top-8">
          <Card>
            <CardHeader>
              <CardTitle>The Chart</CardTitle>
            </CardHeader>
            <CardContent>
              <PieChartComponent activities={activitiesForDisplay} inputMode={currentMode} />
              <div className="mt-6">
                <ChartLegendComponent activities={activitiesForDisplay} />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="order-2 w-full space-y-6 lg:w-2/5">
          <InterestingFactsComponent facts={facts} />
        </section>
      </div>

      <div className="py-8 mt-12 text-center">
        <Button asChild size="lg">
          <Link href="/">Create Your Own Time Chart</Link>
        </Button>
      </div>
    </div>
  );
} 
