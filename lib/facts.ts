import type { Activity } from '@/types';

export interface Fact {
  id: string;
  text: string;
  // severity?: 'info' | 'warning' | 'neutral'; // Optional for styling later
}

// Helper to identify specific categories by name (case-insensitive)
const isCategory = (activityName: string, targetCategory: string): boolean => {
  return activityName.trim().toLowerCase() === targetCategory.trim().toLowerCase();
};

// --- Calculation Functions ---

function getLargestSlice(activities: Activity[]): Fact | null {
  if (!activities || activities.length === 0) return null;
  const largest = activities.reduce((prev, current) =>
    (prev.value > current.value) ? prev : current
  );
  if (largest.value <= 0) return null;
  return {
    id: 'largest-slice',
    text: `Your largest activity is ${largest.name} with ${largest.value.toFixed(1)} hours (${((largest.value / 168) * 100).toFixed(1)}%).`
  };
}

function getSmallestSlice(activities: Activity[]): Fact | null {
  if (!activities || activities.length === 0) return null;
  const positiveActivities = activities.filter(act => act.value > 0);
  if (positiveActivities.length === 0) return null;

  const smallest = positiveActivities.reduce((prev, current) =>
    (prev.value < current.value) ? prev : current
  );
  return {
    id: 'smallest-slice',
    text: `Your smallest activity is ${smallest.name} with ${smallest.value.toFixed(1)} hours (${((smallest.value / 168) * 100).toFixed(1)}%).`
  };
}

function getSleepTotal(activities: Activity[]): Fact | null {
  const sleepActivities = activities.filter(act => isCategory(act.name, "Sleep"));
  if (sleepActivities.length === 0) return null;
  const totalSleep = sleepActivities.reduce((sum, act) => sum + act.value, 0);
  if (totalSleep <= 0) return null;

  let factText = `You've allocated ${totalSleep.toFixed(1)} hours to Sleep.`;
  if (totalSleep < 49) { // Less than 7 hours/night average
    factText += " Consider aiming for 7-9 hours per night for optimal rest.";
  } else if (totalSleep > 63) { // More than 9 hours/night average
    factText += " That's a generous amount of rest!";
  }
  return { id: 'sleep-total', text: factText };
}

function getWorkTotal(activities: Activity[]): Fact | null {
  // Could also include variations like "Work/Study", "Job", etc.
  const workActivities = activities.filter(act => isCategory(act.name, "Work"));
  if (workActivities.length === 0) return null;
  const totalWork = workActivities.reduce((sum, act) => sum + act.value, 0);
  if (totalWork <= 0) return null;

  return {
    id: 'work-total',
    text: `You've dedicated ${totalWork.toFixed(1)} hours to Work activities.`
  };
}

// Example: Productive total (assumes categories like "Work", "Study", "Exercise")
function getProductiveTotal(activities: Activity[]): Fact | null {
  const productiveKeywords = ["work", "study", "exercise", "learning", "project"]; // Configurable
  const productiveActivities = activities.filter(act =>
    productiveKeywords.some(keyword => act.name.toLowerCase().includes(keyword))
  );
  if (productiveActivities.length === 0) return null;
  const totalProductive = productiveActivities.reduce((sum, act) => sum + act.value, 0);
  if (totalProductive <= 0) return null;

  return {
    id: 'productive-total',
    text: `You have ${totalProductive.toFixed(1)} hours of activities that could be considered productive.`
  };
}

// --- Main Fact Generation Function ---

/**
 * Generates a list of interesting facts based on the activities.
 * Ensures activities are in HOURS before calling this.
 * PRD 5.3: "Config-driven rules so new facts can be added without code change."
 * This current implementation is not fully config-driven but provides a foundation.
 * To make it config-driven, the fact generator functions and their triggers (keywords, conditions)
 * could be defined in a JSON configuration file.
 */
export function generateFacts(activitiesInHours: Activity[]): Fact[] {
  const facts: Fact[] = [];

  // Ensure input is in hours, or convert if necessary (caller should handle this for now)
  // For simplicity, this function assumes activities are passed in hours.

  const largest = getLargestSlice(activitiesInHours);
  if (largest) facts.push(largest);

  const smallest = getSmallestSlice(activitiesInHours);
  if (smallest) facts.push(smallest);

  const sleep = getSleepTotal(activitiesInHours);
  if (sleep) facts.push(sleep);

  const work = getWorkTotal(activitiesInHours);
  if (work) facts.push(work);

  const productive = getProductiveTotal(activitiesInHours);
  if (productive) facts.push(productive);

  // Add more fact generators here as needed

  if (facts.length === 0 && activitiesInHours.length > 0) {
    facts.push({ id: 'no-specific-facts', text: 'Your time allocation is unique! Add more details for specific insights.' });
  }

  return facts;
}

// Example usage (primarily for testing/dev):
/*
const exampleActivities: Activity[] = [
  { id: '1', name: 'Work', value: 40, color: '#ff0000' },
  { id: '2', name: 'Sleep', value: 56, color: '#00ff00' },
  { id: '3', name: 'Exercise', value: 7, color: '#0000ff' },
  { id: '4', name: 'Eating', value: 10, color: '#ffff00' },
  { id: '5', name: 'Commute', value: 5, color: '#ff00ff' },
  { id: '6', name: 'Leisure', value: 50, color: '#00ffff' }, // Total = 168
];

const facts = generateFacts(exampleActivities);
console.log(facts);
*/ 
