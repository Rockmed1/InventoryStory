"use client";

import { CalendarIcon } from "lucide-react";

import { Button } from "@/app/_components/_ui/client/shadcn-Button";
import { Calendar } from "@/app/_components/_ui/client/shadcn-Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/_ui/client/shadcn-Popover";
import { cn } from "@/app/_utils/utils";
import { useEffect, useRef, useState } from "react";
import { Input } from "./shadcn-Input";

function formatDate(date) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export default function DatePicker({ field }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(field.value || new Date());
  const [inputValue, setInputValue] = useState(
    field.value ? formatDate(field.value) : "",
  );
  const isUpdatingInternally = useRef(false);

  useEffect(() => {
    if (isUpdatingInternally.current) {
      isUpdatingInternally.current = false;
      return;
    }
    setInputValue(formatDate(field.value));
  }, [field.value]);

  return (
    <div className="relative flex items-center">
      <Input
        id="date"
        name={field.name}
        value={inputValue}
        placeholder={new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        className="bg-background pr-10"
        onChange={(e) => {
          setInputValue(e.target.value);
        }}
        onBlur={() => {
          if (!inputValue) {
            isUpdatingInternally.current = true;
            field.onChange(null);
            field.onBlur();
            return;
          }
          const date = new Date(inputValue);
          if (isValidDate(date)) {
            isUpdatingInternally.current = true;
            field.onChange(date); // Update form state
            setInputValue(formatDate(date));
            field.onBlur();
            setMonth(date);
          } else {
            // if the user entered an invalid date, revert to the last valid one
            setInputValue(formatDate(field.value));
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />

      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            className={cn(
              "absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0",
              !field.value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          // className="w-auto overflow-hidden p-0"
          className="z-[2000] w-auto p-0"
          /* align="end" */ align="end"
          alignOffset={-8}
          sideOffset={10}
        >
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={field.value}
            month={month}
            onMonthChange={setMonth}
            fromYear={1979}
            toYear={new Date().getFullYear()}
            onSelect={(date) => {
              isUpdatingInternally.current = true;
              field.onChange(date);
              setInputValue(formatDate(date));
              setOpen(false);
            }}
            disabled={(date) =>
              date > new Date() || date < new Date("1997-01-01")
            }
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
