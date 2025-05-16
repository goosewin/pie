"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Fact } from "@/lib/facts";
import { Lightbulb } from "lucide-react"; // Or any other suitable icon

interface InterestingFactsProps {
  facts: Fact[];
}

export function InterestingFactsComponent({ facts }: InterestingFactsProps) {
  if (!facts || facts.length === 0) {
    return null; // Don't render anything if there are no facts
  }

  return (
    <Card className="mt-8">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl">
          <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
          Interesting Facts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 list-disc list-inside pl-2 text-sm text-muted-foreground">
          {facts.map((fact) => (
            <li key={fact.id}>{fact.text}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 
