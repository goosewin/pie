"use client"; // Error components must be Client Components

import { Button } from "@/components/ui/button";
import { track } from "@vercel/analytics/react"; // Import track
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    // For now, just log to console. In a real app, use Sentry, LogRocket, etc.
    console.error(error);
    track("application_error", {
      message: error.message,
      digest: error.digest ?? null,
      // Optional: stringify the full error if needed, but be mindful of PII
      // error_details: JSON.stringify(error, Object.getOwnPropertyNames(error))
    });
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-3xl font-bold text-destructive mb-4">Oops! Something went wrong.</h1>
      <p className="text-lg text-muted-foreground mb-6">
        We encountered an unexpected issue. Please try again.
      </p>
      {error.message && (
        <p className="mb-4 text-sm bg-destructive/10 p-3 rounded-md text-destructive">
          Error details: {error.message}
        </p>
      )}
      <Button
        onClick={() => reset()} // Attempt to recover by re-rendering the segment
        size="lg"
      >
        Try Again
      </Button>
    </main>
  );
} 
