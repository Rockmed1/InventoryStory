"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { DropDown } from "../_ui/client/DropDown";
import { Button } from "../_ui/client/shadcn-Button";
import DatePicker from "../_ui/client/shadcn-DatePicker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../_ui/client/shadcn-Form";
import { Input } from "../_ui/client/shadcn-Input";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  dob: z.date({
    required_error: "A date of birth is required.",
  }),
  itemClass: z.string().min(2, {
    message: "Item class must be selected",
  }),
});

function onSubmit(values) {
  console.log(values);
}

export function TestForm() {
  //1-Define the form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      dob: undefined,
      itemClass: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dob"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of birth</FormLabel>
              <DatePicker field={field} />
              <FormDescription>
                Your Date of birth is used to calculate your age.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="itemClass"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Class</FormLabel>

              <DropDown
                field={field}
                entity="itemClass"
                name="_item_class_id"
                label="item class"
              />
              <FormDescription>Pick an item class.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
