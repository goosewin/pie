export type InputMode = "hours" | "percentage";

export interface Activity {
  id: string; // Use string for potential UUIDs later
  name: string;
  value: number;
  color: string; // Store color as hex string (e.g., "#RRGGBB")
}

// Type for the data structure to be encoded in the URL
export interface SharedChartData {
  activities: Omit<Activity, 'id'>[]; // Exclude ID for potentially shorter URL? Or keep it?
  // Let's keep ID for now, simpler to reuse Activity type.
  // activities: Activity[]; 
}

// Revised: Keep it simple, just serialize the activities array directly.
// No need for a separate SharedChartData type if it's just { activities: Activity[] }

// Let's define the serialized structure explicitly if we want to control it,
// otherwise we can just use Activity[] directly.

// Final Decision: Keep it simple for V1 encoding. We will serialize Activity[].
// Adding a type alias for clarity.

// export type SerializedDataV1 = Activity[];

// Revised for V1.1: Include mode in serialized data
export interface SerializedDataV1 {
  activities: Activity[];
  mode: InputMode;
} 
