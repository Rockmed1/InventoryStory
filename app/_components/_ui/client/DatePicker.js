"use client";

import { CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/app/_components/_ui/client/Button-shadcn";
import { Calendar } from "@/app/_components/_ui/client/Calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/_components/_ui/client/Popover";
import Form from "./Form";

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

export default function DatePicker({ name, error, onChange }) {
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState(new Date());
  const [month, setMonth] = React.useState(date);
  const [value, setValue] = React.useState(formatDate(date));

  return (
    <div className="flex flex-col gap-3">
      {/* <Form.Label htmlFor="date" className="px-1">
        Select Date *
      </Form.Label> */}
      <div className="relative flex gap-2">
        {/* <Form.Input
          id="date"
          inputValue={value}
          placeholder={new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          className="bg-background pr-10"
          onChange={(e) => {
            const date = new Date(e.target.value);
            console.log(date);
            setValue(e.target.value);
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
        /> */}
        <Form.InputWithLabel
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
        </Form.InputWithLabel>

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
                onChange?.(formatDate(date));
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
