"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/_ui/client/shadcn/shadcn-Select";
import useClientData from "@/app/_lib/data/client/useClientData";
import { getEntityDisplayLabel } from "@/app/_utils/helpers";
import { useEffect, useState } from "react";
import SpinnerMini from "../server/SpinnerMini";

export function DropDown({ entity, field, handleChange, ...props }) {
  const [isMounted, setIsMounted] = useState(false);

  const {
    data: entityList,
    isLoading,
    isError,
    error,
  } = useClientData({
    entity,
    options: {
      select: (data) => {
        if (!Array.isArray(data)) return [];
        return data.map((_) => ({
          idField: _.idField,
          nameField: _.nameField,
        }));
      },
    },
  });

  // Fix hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const label = getEntityDisplayLabel(entity);

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center gap-2">
        <SpinnerMini />
        <span>Loading {label}...</span>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (entityList.length === 0) {
    console.error(`⚠️🔍 ${entity} data array is empty!`);
    return (
      <Select disabled>
        <SelectTrigger className="w-m">
          <SelectValue placeholder={`⚠️🔍 No ${label}s available`} />
        </SelectTrigger>
      </Select>
    );
  }

  const selected = entityList.find(
    (_) => _.idField.toString() === field.value?.toString(),
  );

  return (
    <Select
      onValueChange={async (value) => {
        if (!isMounted) return;

        if (value === "none") {
          field.onChange(null);
          field.onBlur();
        } else {
          const newSelected = entityList.find(
            (_) => _.idField.toString() === value?.toString(),
          );

          if (newSelected) {
            field.onChange(parseInt(value));
            field.onBlur();
            handleChange?.(value);
          }
        }
      }}
      value={field.value?.toString() || ""}
      {...props}>
      <SelectTrigger>
        <SelectValue placeholder={`Select ${label}`}>
          {/* Show the actual name of the selected item if in edit form and field.value is passed from the form.defaultValues*/}
          {field.value && selected ? selected?.name : `Select ${label}`}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="z-[2000]">
        <SelectItem value="none">
          <span className="text-gray-500 italic">-- None --</span>
        </SelectItem>
        {entityList.map((_) => (
          <SelectItem key={_.idField} value={_.idField.toString()}>
            {_.nameField}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
