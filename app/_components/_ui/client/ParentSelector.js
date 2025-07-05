"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/_ui/client/Select";
import { useAppStore } from "@/app/_store/AppProvider";

/**
 * A dropdown selector that is dynamically populated from a slice of the global app store.
 * It is designed to select a "parent" entity from a list.
 *
 * @param {string} parent - The key of the data slice in the global store (e.g., 'locations', 'itemClasses').
 * @param {string} _col_name - The name attribute for the select input, corresponding to the database column name.
 * @param {string} label - A user-friendly label for the selector (e.g., 'location', 'item class').
 * @param {boolean} [required=true] - Whether the select input is required.
 */
export function ParentSelector({ parent, _col_name, label, required = true }) {
  //get the parent [parents] and remove the description column
  const parents = useAppStore((state) => state[parent] || []).map((_) => ({
    id: _.id,
    name: _.name,
  }));

  // More detailed logging
  // console.log("📍 Raw parents from store:", parents);
  // console.log(
  //   "🏪 Full store state:",
  //   useAppStore((state) => state),
  // );

  if (parents.length === 0) {
    console.log("⚠️ Parents array is empty");
    return (
      <Select disabled>
        <SelectTrigger className="w-m">
          <SelectValue placeholder={`No ${label}s available in the store`} />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      name={_col_name}
      onValueChange={(value) => {
        console.log("🎯 Selected value:", value);
      }}
      required={required}>
      <SelectTrigger className="w-m">
        <SelectValue placeholder={`Select ${label}`} />
      </SelectTrigger>
      <SelectContent className="z-[2000]">
        {parents.map((parent) => (
          <SelectItem key={parent.id} value={parent.id.toString()}>
            {parent.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
