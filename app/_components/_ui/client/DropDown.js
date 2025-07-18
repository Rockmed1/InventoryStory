"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/_ui/client/Select";
import entityConfig from "@/app/_lib/appConfig";
import { useAppStore } from "@/app/_store/AppProvider";

/**
 * A dropdown DropDown that is dynamically populated from a slice of the global app store.
 * It is designed to select a "entity" entity from a list.
 *
 * @param {string} entity - The key of the data slice in the global store (e.g., 'locations', 'itemClasses').
 * @param {string} name - The name attribute for the select input, corresponding to the database column name.
 * @param {string} label - A user-friendly label for the DropDown (e.g., 'location', 'item class').
 * @param {boolean} [required=true] - Whether the select input is required.
 */
export function DropDown({
  entity,
  name,
  required = true,
  defaultValue = null,
  onChange,
}) {
  //get the entity [entityList] and remove the description column
  const entityList = useAppStore((state) => state[entity] || []).map((_) => ({
    id: _.id,
    name: _.name,
  }));

  //Find the selected entity name for display
  const selected = defaultValue
    ? entityList.find(
        (entity) => entity.id.toString() === defaultValue.toString(),
      )
    : null;

  // console.log(defaultValue);
  // console.log(selected);
  // More detailed logging
  // console.log("📍 Raw entityList from store:", entityList);
  // console.log(
  //   "🏪 Full store state:",
  //   useAppStore((state) => state),
  // );
  const { label } = entityConfig(entity);

  if (entityList.length === 0) {
    console.log(`⚠️ ${entity} data array is empty in cache`);
    return (
      <Select disabled>
        <SelectTrigger className="w-m">
          <SelectValue placeholder={`⚠️ No ${label}s available`} />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select
      onValueChange={(value) => {
        // console.log("🎯 Selected value:", value);
        onChange?.(value);
      }}
      name={name}
      defaultValue={defaultValue?.toString()}
      required={required}>
      <SelectTrigger className="w-m">
        <SelectValue
          placeholder={`Select ${label}`}
          defaultValue={selected?.name}
        />
      </SelectTrigger>
      <SelectContent className="z-[2000]">
        {entityList.map((_) => (
          <SelectItem key={_.id} value={_.id.toString()}>
            {_.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}