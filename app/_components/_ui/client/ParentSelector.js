"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/_ui/client/Select";
import { useAppStore } from "@/app/_store/AppProvider";

export function ParentSelector({ parent, _col_name, label, required = true }) {
  //get the parent [parents] and remove the description column
  const parents = useAppStore((state) => state[parent]).map((_) => ({
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
          <SelectValue placeholder="No parents available" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      name={_col_name}
      // value={(value) => parents.find((loc) => loc.id === value)}
      onValueChange={(value) => {
        console.log("🎯 Selected value:", value);
      }}
      required={required}>
      <SelectTrigger className="w-m">
        <SelectValue placeholder={`Select a ${label}`} />
      </SelectTrigger>
      <SelectContent className="z-[2000]">
        {parents.map((parent) => {
          console.log("🗂️ Mapping parent:", parent);
          return (
            <SelectItem key={parent.id} value={parent.id.toString()}>
              {parent.name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
{
  /* <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem> */
}
