"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/_ui/client/Select";
import { getClientData } from "@/app/_utils/helpers-client";
import { useQuery } from "@tanstack/react-query";
import SpinnerMini from "../SpinnerMini";

export function DropDown({
  entity,
  name,
  required = true,
  defaultValue = null,
  label,
  onChange,
}) {
  const {
    data: entityList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [entity],
    queryFn: () => getClientData(entity),
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => {
      if (!Array.isArray(data)) return [];
      return data.map((_) => ({
        id: _.id,
        name: _.name,
      }));
    },
  });

  if (isLoading) {
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

  //Find the selected entity name for display
  const selected =
    defaultValue && entityList
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
  // const { label } = entityConfig(entity);

  if (entityList.length === 0) {
    console.log(`⚠️ ${entity} data array is empty`);
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
