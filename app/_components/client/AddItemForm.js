"use client";

import { useValidationSchema } from "@/app/_hooks/useValidationSchema";
import { createFormData } from "@/app/_utils/helpers-client";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { createItem } from "../../_lib/server/actions";
import { DropDown } from "../_ui/client/DropDown";
import { Button } from "../_ui/client/shadcn-Button";
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
import Spinner from "../_ui/server/Spinner";
import SpinnerMini from "../_ui/server/SpinnerMini";

export default function AddItemForm({ onCloseModal }) {
  const queryClient = useQueryClient();

  // 2- get the validation schema with refreshed validation data
  const { schema } = useValidationSchema("item", "create");

  console.log("AddItemForm schema: ", schema);

  //3- server action fallback for progressive enhancement (works withour JS)
  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
    // formData: null,
  };

  const [formState, formAction, pending] = useActionState(
    createItem,
    initialState,
  );

  //4- Enhanced form management (JS available)
  const form = useForm({
    resolver: schema ? zodResolver(schema) : null,
    defaultValues: {
      itemClassId: "",
      nameField: "",
      descField: "",
    },
    mode: "onBlur", //onTouched
  });

  const {
    register,
    control,
    handleSubmit,
    formState: { isSubmitting, isValid, errors },
    setError,
    clearErrors,
    reset,
  } = form;

  //5- Enhanced Mutation  (JS available)
  //! maybe extract into cusom hook

  const mutation = useMutation({
    mutationFn: async (data) => {
      //Convert RHF data to FormData for server action compatibility (incase js is unavailable the default data passed is formData. if only js then this conversion will not be needed )
      const formData = createFormData(data);

      //Call server action directly
      const result = await createItem(null, formData);

      //Transform server action response for mutation
      if (!result.success) {
        const error = new Error(result.message || "Server error occured");
        error.zodErrors = result.zodErrors;
        // error.formData = result.formData;
        throw error;
      }

      return result;
    },

    // Optimistic update:
    onMutate: async (newItem) => {
      //cancel ongoing refetches
      await queryClient.cancelQueries({ queryKey: ["item"] });

      //Snapshot previous values
      const previousValues = queryClient.getQueryData(["item"]);

      //optimistically update cache
      queryClient.setQueryData(["item"], (old = []) => [
        ...old,
        { ...newItem, id: `temp-${Date.now()}`, optimistic: true },
      ]);

      return { previousValues };
    },

    //Success Handling
    onSuccess: (result, variables) => {
      //Replace optimistic update with real data
      // queryClient.setQueryData(["item"], (old = []) =>
      //   old.map((item) =>
      //     item.optimistic && item.nameField === variables.item_name
      //       ? { ...result.formData, id: result.id }
      //       : item,
      //   ),
      // );

      //! may be should refetch
      queryClient.invalidateQueries({
        queryKey: ["item"],
        refetchType: "none", //don't show loading state
      });
      //UI feedback //! may be grab the newly created id here...
      toast.success(`Item ${variables.nameField} was created successfully!`);
      form.reset();
      onCloseModal?.();
    },

    //Error Handling (JS Enhanced)
    onError: (error, variables, context) => {
      //Roll back optimistic update
      if (context?.previousValues) {
        queryClient.setQueryData(["item"], context.previousValues);
      }

      //! may be make a default to redirect the user to login page if the error is 401
      //Handle Different error types
      if (error.zodErrors) {
        //Set field-specific validation errors in RHF
        Object.entries(error.zodErrors).forEach(([field, errors]) =>
          form.setError(field, {
            type: "server",
            message: Array.isArray(errors) ? errors[0] : errors,
          }),
        );
        //! may be put this message on the top of the form
        toast.error("Please fix the validation errors");
      } else if (error.name === "NetworkError") {
        //Network specific error handling
        toast.error(
          "Network error. Please check your connection and try again.",
        );
        form.setError("root", {
          type: "network",
          message: "Connection failed. Please try again.",
        });
      } else {
        //Generic server errors
        toast.error(error.message || "Failed to create item");
        form.setError("root", {
          type: "server",
          message: error.message || "An unexpected error occured",
        });
      }
    },

    //retry logic
    retry: (failureCount, error) => {
      //Retry network errors but not validation errors
      return error.name === "NetworkError" && failureCount < 3;
    },
  });

  const { mutate, isPending, isSuccess, error } = mutation;
  //6- Progressive enhancement submit handler

  // const [clientFormState, setClientFormState] = useState(initialState);

  // const currentFormState = clientFormState?.message
  //   ? clientFormState
  //   : formState;

  function onSubmit(data, e) {
    console.log("Form submitted: ", data);

    // 🎯 BINARY DECISION: JavaScript Available & Mutation Ready?
    const isJavaScriptReady =
      mutation && !mutation.isPending && typeof mutation.mutate === "function";

    if (isJavaScriptReady) {
      // ✅ YES: Enhanced Submission
      e.preventDefault();
      mutation.mutate(data);
    }
    // ❌ NO: Native Form Submission (let it proceed naturally)
  }

  // Add loading check
  if (!schema) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            action={formAction}
            method="POST"
            className="space-y-8">
            {/* Global error display */}
            {(form.formState.errors.root || formState.message) && (
              <div className="error-banner rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {form.formState.errors.root?.message || formState?.message}
              </div>
            )}

            <FormField
              control={form.control}
              name="itemClassId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Class</FormLabel>
                  <DropDown
                    field={field}
                    entity="itemClass"
                    name="itemClassId"
                    label="item class"
                  />
                  <FormDescription>Pick an item class.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item name</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>Enter new item name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item description</FormLabel>
                  <FormControl>
                    <Input placeholder="shadcn" {...field} />
                  </FormControl>
                  <FormDescription>Enter new item name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-3">
              <Button
                disabled={mutation.isPending || !form.formState.isValid}
                variant="outline"
                type="submit">
                {mutation.isPending && <SpinnerMini />}
                <span> Add Item</span>
              </Button>

              <Button
                type="button"
                onClick={onCloseModal}
                variant="destructive"
                disabled={mutation.isPending}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      }
      <DevTool control={form.control} />
    </>
  );
}
