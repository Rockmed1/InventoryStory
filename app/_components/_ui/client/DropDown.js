"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/_ui/client/shadcn-Select";
import useClientData from "@/app/_hooks/useClientData";
import { useEffect, useState } from "react";
import SpinnerMini from "../server/SpinnerMini";
import { FormControl } from "./shadcn-Form";

export function DropDown({ field, entity, label, form }) {
  const [isMounted, setIsMounted] = useState(false);

  const {
    data: entityList,
    isLoading,
    isError,
    error,
    isPlaceholderData,
  } = useClientData({
    entity,
    select: (data) => {
      if (!Array.isArray(data)) return [];
      return data.map((_) => ({
        id: _.id,
        name: _.name,
      }));
    },
  });

  // Fix hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // if (!isMounted) {
  //   return (
  //     <div className="flex items-center gap-2">
  //       <SpinnerMini />
  //       <span>Loading {label}...</span>
  //     </div>
  //   );
  // }

  if (!isMounted || isLoading) {
    // console.log("DropDown isLoading: ", isLoading);
    // console.log("isPlaceholderData: ", isPlaceholderData);
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
    console.log(`⚠️🔍 ${entity} data array is empty`);
    return (
      <Select disabled>
        <SelectTrigger className="w-m">
          <SelectValue placeholder={`⚠️🔍 No ${label}s available`} />
        </SelectTrigger>
      </Select>
    );
  }

  // Find the selected item name to display
  // const selectedName = (id) =>
  //   entityList.find(
  //     (item) => item.id.toString() === field.value?.[id]?.toString(),
  //   );
  const selected = entityList.find(
    (_) => _.id.toString() === field.value?.toString(),
  );
  // console.log("DropDown entityList: ", entityList);
  // console.log("DropDown field: ", field);
  // console.log("DropDown selected: ", selected);

  return (
    <Select
      onValueChange={async (value) => {
        console.log("🔍 DropDown onValueChange triggered with:", value);

        const newSelected = entityList.find(
          (_) => _.id.toString() === value?.toString(),
        );

        console.log("🔍 newSelected:", newSelected);

        if (newSelected) {
          console.log("🔍 Before field.onChange, field.value:", field.value);

          field.onChange(parseInt(value));

          console.log("🔍 After field.onChange, field.value:", field.value);

          // Wait a tick for the change to propagate
          // await new Promise((resolve) => setTimeout(resolve, 0));

          console.log("🔍 Calling field.onBlur()");

          field.onBlur();

          console.log("🔍 Calling validationTrigger for field:", field.name);

          // const validationResult = await form?.trigger?.(field.name);

          // console.log("🔍 Validation result:", validationResult);

          // Also check form state after validation
          // console.log("🔍 Form state after validation:", {
          //   isValid: form.formState.isValid,
          //   errors: form.formState.errors,
          //   values: form.getValues(),
          // });
          console.log("🔍 After form.trigger, field.value:", field.value);
        }
      }}
      value={field.value?.toString() || ""}
      modal={true}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label}`}>
            {/* Show the actual name of the selected item if in edit form and field.value is passed from the form.defaultValues*/}
            {field.value && selected ? selected?.name : `Select ${label}`}
          </SelectValue>
        </SelectTrigger>
      </FormControl>
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
