"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Popover for color picker
import type { Activity, InputMode } from "@/types";
import { useSortable } from '@dnd-kit/sortable'; // For drag and drop
import { CSS } from '@dnd-kit/utilities'; // For drag and drop styling
import { track } from "@vercel/analytics/react"; // Import track
import { GripVertical, Trash2 } from 'lucide-react'; // Added GripVertical
import React, { useEffect, useState } from 'react';
import { HexColorPicker } from 'react-colorful'; // Color Picker
import { useDebouncedCallback } from 'use-debounce'; // For debouncing color changes

interface ActivityRowProps {
  activity: Activity;
  onActivityChange: (id: string, updatedActivity: Partial<Activity>) => void;
  onRemoveActivity: (id: string) => void;
  inputMode: InputMode;
}

export function ActivityRow({
  activity,
  onActivityChange,
  onRemoveActivity,
  inputMode,
}: ActivityRowProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  // State for the input field's string value and any validation error
  const [localValueStr, setLocalValueStr] = useState(String(activity.value === 0 && !activity.name ? '' : activity.value));
  const [valueErrorMsg, setValueErrorMsg] = useState<string | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1, // Visual feedback for dragging item
    zIndex: isDragging ? 10 : undefined, // Ensure dragging item is on top
  };

  // Effect to update localValueStr when activity.value changes externally (e.g., mode switch)
  useEffect(() => {
    // Update local string if the parent's numeric value changes, respecting the "empty if 0 and no name" rule.
    const newDisplayValue = activity.value === 0 && !activity.name ? '' : String(activity.value);
    if (parseFloat(localValueStr) !== activity.value || localValueStr === '') { // Avoid loops if already same or localValueStr is being actively typed
      if (localValueStr !== newDisplayValue && !(document.activeElement?.id === `value-input-${activity.id}`)) {
        setLocalValueStr(newDisplayValue);
        setValueErrorMsg(null); // Clear errors on external update
      }
    }
  }, [activity.value, activity.name, localValueStr, activity.id]);

  const debouncedColorChange = useDebouncedCallback(
    (color: string) => {
      onActivityChange(activity.id, { color });
    },
    50 // 50ms debounce
  );

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onActivityChange(activity.id, { name: e.target.value });
  };

  const validateAndSetNumericValue = (valStr: string, isBlurEvent: boolean) => {
    if (valStr === '') {
      setValueErrorMsg(null);
      if (activity.value !== 0) { // Track only if value actually changes
        track("value_change", { activity_id: activity.id, new_value: 0, old_value: activity.value });
      }
      onActivityChange(activity.id, { value: 0 });
      return true; // Valid (empty maps to 0)
    }

    // Check for invalid characters (anything not a digit or a single period)
    if (/[^0-9.]/.test(valStr) || (valStr.match(/\./g) || []).length > 1) {
      setValueErrorMsg("Invalid number format.");
      return false; // Invalid
    }

    const num = parseFloat(valStr);
    if (isNaN(num)) {
      setValueErrorMsg("Not a valid number.");
      if (isBlurEvent) {
        if (activity.value !== 0) { // Track only if value actually changes to 0
          track("value_change", { activity_id: activity.id, new_value: 0, old_value: activity.value, error: "invalid_number_on_blur" });
        }
        onActivityChange(activity.id, { value: 0 }); // Reset to 0 on blur if totally invalid
        setLocalValueStr("0");
      }
      return false; // Invalid
    }

    // Check for more than 1 decimal place
    if (valStr.includes('.') && valStr.split('.')[1].length > 1) {
      setValueErrorMsg("Max 1 decimal place.");
      if (isBlurEvent) {
        const clamped = Math.round(num * 10) / 10;
        if (activity.value !== clamped) { // Track only if value actually changes
          track("value_change", { activity_id: activity.id, new_value: clamped, old_value: activity.value, context: "blur_clamped" });
        }
        onActivityChange(activity.id, { value: clamped });
        setLocalValueStr(String(clamped)); // Reflect clamping in local input
        setValueErrorMsg(null); // Clear error after clamping on blur
        return true;
      }
      return false; // Invalid for now (until blur or further typing fixes it)
    }

    setValueErrorMsg(null); // Clear error if all checks pass
    if (activity.value !== num) { // Track only if value actually changes
      track("value_change", { activity_id: activity.id, new_value: num, old_value: activity.value });
    }
    onActivityChange(activity.id, { value: num });
    return true; // Valid
  };

  const handleLocalValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValueStr = e.target.value;
    setLocalValueStr(newValueStr); // Update local string state immediately for responsiveness

    // Perform validation on each change to give immediate feedback, but only commit valid complete states
    if (newValueStr === '') {
      setValueErrorMsg(null);
      if (activity.value !== 0) { // Track only if value actually changes
        track("value_change", { activity_id: activity.id, new_value: 0, old_value: activity.value, context: "live_change_empty" });
      }
      onActivityChange(activity.id, { value: 0 });
      return;
    }

    // Tentative validation: mainly for error messages while typing
    if (/[^0-9.]/.test(newValueStr) || (newValueStr.match(/\./g) || []).length > 1) {
      setValueErrorMsg("Invalid number format.");
      return; // Don't call onActivityChange yet
    }

    const num = parseFloat(newValueStr);
    if (isNaN(num)) {
      setValueErrorMsg("Not a valid number.");
      return; // Don't call onActivityChange yet
    }

    if (newValueStr.includes('.') && newValueStr.split('.')[1].length > 1) {
      setValueErrorMsg("Max 1 decimal place.");
      // Potentially call onActivityChange with the current (multi-decimal) number
      // or wait for blur. For now, just show error and update parent state.
      if (activity.value !== num) { // Track only if value actually changes
        track("value_change", { activity_id: activity.id, new_value: num, old_value: activity.value, context: "live_change_gt_1_decimal" });
      }
      onActivityChange(activity.id, { value: num }); // Let parent receive it, PRD total validation will catch it
      return;
    }

    setValueErrorMsg(null);
    if (activity.value !== num) { // Track only if value actually changes
      track("value_change", { activity_id: activity.id, new_value: num, old_value: activity.value, context: "live_change_valid" });
    }
    onActivityChange(activity.id, { value: num });
  };

  const handleValueInputBlur = () => {
    validateAndSetNumericValue(localValueStr, true);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col py-3 ${isDragging ? 'opacity-50' : ''} border-b-2 border-foreground last:border-b-0 mb-3 space-y-1.5`}
    >
      <div className="flex items-center gap-2"> {/* Adjusted gap to default `gap-2` from `gap-2.5` for tighter fit */}
        <Button
          variant="link"
          size="icon" // Changed size to sm for a smaller handle button
          {...attributes} {...listeners}
          className="flex-shrink-0 w-1 p-2 cursor-grab touch-none text-foreground/70 hover:text-foreground" // Ensure it doesn't grow, reduce padding if needed
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" /> {/* Reduced icon size */}
        </Button>
        <Input
          type="text"
          placeholder="Activity"
          value={activity.name}
          onChange={handleNameChange}
          className="flex-grow bg-transparent border-2 border-foreground h-10 px-3 !ring-offset-0 placeholder:text-muted-foreground focus:border-primary text-base"
        />
        <Input
          id={`value-input-${activity.id}`}
          type="text"
          inputMode="decimal"
          placeholder={inputMode === "hours" ? "H" : "%"}
          value={localValueStr}
          onChange={handleLocalValueChange}
          onBlur={handleValueInputBlur}
          className="w-36 bg-transparent border-2 border-foreground h-10 px-3 text-right !ring-offset-0 placeholder:text-muted-foreground focus:border-primary text-base" // Increased width to w-36
        />
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-10 h-10 p-0 border-2 border-foreground hover:bg-accent flex-shrink-0 !ring-offset-0 shadow-[2px_2px_0px_0px_var(--foreground)] hover:shadow-[1px_1px_0px_0px_var(--foreground)] transition-shadow duration-150 ease-in-out"
              aria-label={`Change color for ${activity.name}`}
              style={{ backgroundColor: activity.color }}
              onClick={() => setIsPopoverOpen(true)}
            >
              {/* Visual cue for color */}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-2 border-foreground bg-card shadow-[4px_4px_0px_0px_var(--foreground)]">
            <HexColorPicker
              color={activity.color}
              onChange={debouncedColorChange}
            />
          </PopoverContent>
        </Popover>
        <Button
          variant="link"
          size="icon"
          onClick={() => onRemoveActivity(activity.id)}
          aria-label="Remove activity"
          className="text-destructive/80 hover:text-destructive hover:cursor-pointer p-0.5 w-4 flex-shrink-0 !ring-offset-0"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      {valueErrorMsg && (
        <div className="pl-[36px] text-destructive text-xs font-medium" aria-live="polite"> {/* Adjusted left padding to align with inputs after smaller drag handle */}
          {valueErrorMsg}
        </div>
      )}
    </div>
  );
} 
