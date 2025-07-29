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
import { useEffect, useState } from "react";
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

  // const [date, setDate] = useState(new Date());
  // const [value, setValue] = useState(formatDate(date));

  //Sync input value when field value changes
  useEffect(() => {
    setInputValue(formatDate(field.value));
  }, [field.value]);

  return (
    <div className="relative flex items-center">
      <Input
        {...field} // Pass field props to bind to react-hook-form
        id="date"
        value={inputValue}
        placeholder={new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        className="bg-background pr-10"
        onChange={(e) => {
          const date = new Date(e.target.value);
          console.log(date);

          const newInputValue = e.target.value;
          setInputValue(newInputValue);

          if (isValidDate(date)) {
            field.onChange(date); // Update form state
            setMonth(date);
          } else {
            field.onChange(undefined); // Clear form state if date is invalid
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            className={cn(
              "absolute top-1/2 right-2 h-6 w-6 -translate-y-1/2 p-0",
              !field.value && "text-muted-foreground",
            )}>
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          // className="w-auto overflow-hidden p-0"
          className="w-auto p-0"
          /* align="end" */ align="end"
          alignOffset={-8}
          sideOffset={10}>
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={field.value}
            month={month}
            onMonthChange={setMonth}
            fromYear={1979}
            toYear={new Date().getFullYear()}
            onSelect={(date) => {
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

      {/* <Form.InputWithLabel
          name={name}
          inputValue={value}
          placeholder={new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          className="bg-background pr-10"
          onChange={(e) => {
            const date = new Date(e.target.value);

            setValue(e.target.value);
            onChange?.(formatDate(date));

            if (isValidDate(date)) {
              setDate(date);
              setMonth(date);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          error={error}>
          Select Date *
        </Form.InputWithLabel> */}
      {/* 
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-8/12 right-2 size-6 -translate-y-1/2">
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}>
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                setDate(date);
                setValue(formatDate(date));
                setOpen(false);
                // onChange?.(formatDate(date));
              }}
            />
          </PopoverContent>
        </Popover> */}
    </div>
  );
}

// <FormItem className="flex flex-col">
//   <FormLabel>Date of birth</FormLabel>
//   <Popover>
//     <PopoverTrigger asChild>
//       <FormControl>
//         <Button
//           variant={"outline"}
//           className={cn(
//             "w-[240px] pl-3 text-left font-normal",
//             !field.value && "text-muted-foreground",
//           )}>
//           {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
//           <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//         </Button>
//       </FormControl>
//     </PopoverTrigger>
//     <PopoverContent className="w-auto p-0" align="start">
//       <Calendar
//         mode="single"
//         selected={field.value}
//         onSelect={field.onChange}
//         disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
//         captionLayout="dropdown"
//       />
//     </PopoverContent>
//   </Popover>
//   <FormDescription>
//     Your date of birth is used to calculate your age.
//   </FormDescription>
//   <FormMessage />
// </FormItem>;
