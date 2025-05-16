"use client";

import { Button } from "@/components/ui/button";
import type { Activity, InputMode } from "@/types";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { track } from "@vercel/analytics/react";
import { PlusCircle } from "lucide-react";
import { ActivityRow } from "./activity-row";

const suggestedCategoryNames = [
  "Sleep",
  "Work",
  "Workout",
  "Cooking",
  "Studies",
  "Commute",
  "Family Time",
  "Socializing",
  "Hobbies",
  "Errands",
];

// Helper to generate unique IDs, can be moved to a util file later
// const generateId = () => Date.now().toString(); // OLD problematic ID
// Use crypto.randomUUID for more robust unique IDs client-side
const generateId = () => crypto.randomUUID();

interface InputFormProps {
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  inputMode: InputMode;
  setInputMode: React.Dispatch<React.SetStateAction<InputMode>>;
}

export function InputForm({
  activities,
  setActivities,
  inputMode,
  // setInputMode,
}: InputFormProps) {
  // const [draggedActivityId, setDraggedActivityId] = useState<string | null>(null); // Part of custom DnD
  // const [dragOverActivityId, setDragOverActivityId] = useState<string | null>(null); // Part of custom DnD

  const addActivity = () => {
    const currentActivityCount = activities.length;
    let suggestedName = "";
    if (currentActivityCount < suggestedCategoryNames.length) {
      // Check if the suggested name is already in use
      let i = 0;
      let potentialName = suggestedCategoryNames[currentActivityCount];
      while (activities.some(act => act.name === potentialName) && i < suggestedCategoryNames.length) {
        potentialName = suggestedCategoryNames[(currentActivityCount + i + 1) % suggestedCategoryNames.length];
        i++;
      }
      // If after checking all suggestions, we still have conflicts (e.g., user manually named activities like suggestions)
      // or if all suggestions are used up by already existing activities with those names,
      // we fallback to a generic name or empty. For now, if a unique suggestion is found, use it.
      if (!activities.some(act => act.name === potentialName) || currentActivityCount + i < suggestedCategoryNames.length) {
        suggestedName = potentialName;
      }
    } else if (currentActivityCount >= 10) {
      // As per PRD: 10 should be the limit on # of activities.
      // We might want to disable the "Add Activity" button in this case.
      // For now, let's prevent adding more than 10.
      console.warn("Maximum number of 10 activities reached.");
      return;
    }


    let defaultValue = 8; // Default to 8 hours
    if (inputMode === "percentage") {
      const totalHoursInWeek = 168;
      defaultValue = Math.round((8 / totalHoursInWeek) * 100 * 10) / 10; // approx 4.8%
    }

    const newActivity: Activity = {
      id: generateId(),
      name: suggestedName,
      value: defaultValue,
      color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
    };
    setActivities([...activities, newActivity]);
    track("add_category");
  };

  const removeActivity = (id: string) => {
    setActivities(activities.filter((act) => act.id !== id));
  };

  const handleActivityChange = (id: string, updatedProps: Partial<Activity>) => {
    setActivities(
      activities.map((act) =>
        act.id === id ? { ...act, ...updatedProps } : act
      )
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 10 pixels before starting a drag
      // an an alternative to `delay` mouse sensor specific property.
      // Useful for preventing drags initiated accidentally by small movements.
      // activationConstraint: {
      //   distance: 10,
      // },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setActivities((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Drag and Drop Handlers (Temporarily commented out as ActivityRow integration is being prioritized)
  /*
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id); // Required for Firefox
    // setDraggedActivityId(id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    // if (targetId !== draggedActivityId) {
    //   setDragOverActivityId(targetId);
    // }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Check if the mouse is truly leaving the droppable area for this item
    // This can be tricky with nested elements. A simple approach:
    // if (e.relatedTarget && (e.currentTarget as Node).contains(e.relatedTarget as Node)) {
    //   return; // Still inside a child element
    // }
    // setDragOverActivityId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    // if (!draggedActivityId || draggedActivityId === targetId) {
    //   setDraggedActivityId(null);
    //   setDragOverActivityId(null);
    //   return;
    // }

    // const draggedItemIndex = activities.findIndex(act => act.id === draggedActivityId);
    // const targetItemIndex = activities.findIndex(act => act.id === targetId);

    // if (draggedItemIndex === -1 || targetItemIndex === -1) return;

    // const newActivities = [...activities];
    // const [draggedItem] = newActivities.splice(draggedItemIndex, 1);
    // newActivities.splice(targetItemIndex, 0, draggedItem);

    // setActivities(newActivities);
    // setDraggedActivityId(null);
    // setDragOverActivityId(null);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // setDraggedActivityId(null);
    // setDragOverActivityId(null);
  };
  */

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={activities} strategy={verticalListSortingStrategy}>
          {activities.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              onActivityChange={handleActivityChange}
              onRemoveActivity={removeActivity}
              inputMode={inputMode}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        onClick={addActivity}
        variant="outline"
        className="w-full !font-semibold border-2 border-foreground shadow-[4px_4px_0px_0px_var(--foreground)] hover:shadow-[2px_2px_0px_0px_var(--foreground)] transition-shadow duration-150 ease-in-out flex items-center justify-center"
        disabled={activities.length >= 10}
      >
        <PlusCircle className="w-5 h-5 mr-2" /> Add Activity
      </Button>
    </div>
  );
} 
