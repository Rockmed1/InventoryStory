"use client";

import { useClientValidationSchema } from "@/app/_lib/validation/client/useClientValidationSchema";
import { createFormData, generateQueryKeys } from "@/app/_utils/helpers";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { createItem } from "../../_lib/data/server/actions";
import { DropDown } from "../_ui/client/DropDown";
import { Button } from "../_ui/client/shadcn/shadcn-Button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../_ui/client/shadcn/shadcn-Form";
import { Input } from "../_ui/client/shadcn/shadcn-Input";
import SpinnerMini from "../_ui/server/SpinnerMini";

export default function AddItemForm({ onCloseModal }) {
  const queryClient = useQueryClient();

  // 2- get the validation schema with refreshed validation data
  const {
    schema,
    isLoading: loadingValidation,
    errors: validationErrors,
    isError,
    debug,
  } = useClientValidationSchema({ entity: "item", operation: "create" });

  //3- server action fallback for progressive enhancement (works withour JS)
  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    createItem,
    initialState,
  );

  //4- Enhanced form management (JS available)
  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      itemClassId: "",
      nameField: "",
      descField: "",
    },
    mode: "onBlur", //onTouched
  });

  // In AddItemForm.js (mutation component)
  const dataParams = { entity: "item", id: "all" };
  const cancelDataParams = { entity: "item" };

  useEffect(() => {
    const mutationKey = generateQueryKeys(dataParams);
    console.log("🔑 AddItemForm query key:", mutationKey);
    console.log("🔑 AddItemForm dataParams:", dataParams);

    // Also log the stringified version to check for deep equality
    // console.log("🔑 AddItemForm stringified key:", JSON.stringify(mutationKey));
  }, []);

  //5- Enhanced Mutation  (JS available)
  const mutation = useMutation({
    mutationFn: async (data) => {
      //Convert RHF data to FormData for server action compatibility
      const formData = createFormData(data);

      //Call server action directly
      const result = await createItem(null, formData);

      //Transform server action response for mutation
      if (!result.success) {
        const error = new Error(result.message || "Server error occurred");
        error.zodErrors = result.zodErrors;
        error.message = result.message;
        throw error;
      }

      return result;
    },

    // Optimistic update:
    onMutate: async (newItem) => {
      // console.log("🔄 Starting optimistic update for:", newItem);

      // Cancel ongoing refetches for this specific query
      await queryClient.cancelQueries({
        queryKey: generateQueryKeys(dataParams),
      });

      // Snapshot previous values
      const previousValues = queryClient.getQueryData(
        generateQueryKeys(dataParams),
      );
      // console.log("📸 Previous values:", previousValues);

      // Create optimistic item
      const optimisticItem = {
        ...newItem,
        idField: `temp-${Date.now()}`,
        optimistic: true,
      };

      // console.log("✨ Adding optimistic item:", optimisticItem);

      // Optimistically update cache
      queryClient.setQueryData(generateQueryKeys(dataParams), (old = []) => {
        const newData = [...old, optimisticItem];
        // console.log("🎯 New cache data length:", newData.length);
        // console.log(
        //   "🎯 Has optimistic items:",
        //   newData.some((item) => item.optimistic),
        // );
        // console.log("🎯 Full optimistic update data:", newData.slice(-3)); // Log last 3 items
        return newData;
      });

      // // Verify the cache was actually updated
      // const updatedCache = queryClient.getQueryData(
      //   generateQueryKeys(dataParams),
      // );
      // console.log("🔍 Cache after optimistic update:", {
      //   length: updatedCache?.length,
      //   hasOptimistic: updatedCache?.some((item) => item.optimistic),
      //   lastItem: updatedCache?.[updatedCache.length - 1],
      // });

      // DON'T call invalidateQueries here - it can interfere with optimistic updates
      // The component will re-render automatically due to setQueryData

      return { previousValues, optimisticItem };
    },

    //Success Handling
    onSuccess: (result, variables, context) => {
      // console.log("✅ Mutation succeeded:", result);

      // Simply refetch fresh data from server
      queryClient.invalidateQueries({
        queryKey: generateQueryKeys({ entity: "item" }),
        refetchType: "active", // This will trigger a fresh fetch
      });

      // UI feedback
      toast.success(`Item ${variables.nameField} was created successfully!`);
      form.reset();
      onCloseModal?.();
    },

    //Error Handling (JS Enhanced)
    onError: (error, variables, context) => {
      console.log("❌ Mutation failed:", error);

      // Roll back optimistic update
      if (context?.previousValues) {
        queryClient.setQueryData(
          generateQueryKeys(dataParams),
          context.previousValues,
        );
      }

      //Handle Different error types
      if (error.zodErrors) {
        //Set field-specific validation errors in RHF
        Object.entries(error.zodErrors).forEach(([field, errors]) =>
          form.setError(field, {
            type: "server",
            message: Array.isArray(errors) ? errors[0] : errors,
          }),
        );
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
        form.setError("root", {
          type: "server",
          message: error.message || "An unexpected error occurred",
        });
      }
    },

    //retry logic
    retry: (failureCount, error) => {
      //Retry network errors but not validation errors
      return error.name === "NetworkError" && failureCount < 3;
    },
  });

  //6- Progressive enhancement submit handler
  function onSubmit(data, e) {
    console.log("🎪 AddItemForm was submitted with data: ", data);
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

  // Don't render form until schema is loaded
  if (loadingValidation || !schema) {
    return <div>Loading form...</div>;
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          action={formAction}
          className="space-y-8">
          {/* Global error display */}
          {(mutation.error?.message ||
            form.formState.errors?.root ||
            formState?.message) && (
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
                <FormControl>
                  <DropDown
                    field={field}
                    entity="itemClass"
                    name="itemClassId"
                    label="item class"
                  />
                </FormControl>
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
                  <Input placeholder="Enter item name" {...field} />
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
                  <Input placeholder="Enter item description" {...field} />
                </FormControl>
                <FormDescription>Enter new item description</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end gap-3">
            {loadingValidation || !schema ? null : (
              <Button
                disabled={mutation.isPending || !form.formState.isValid}
                variant="outline"
                type="submit">
                {mutation.isPending && <SpinnerMini />}
                <span> Add Item</span>
              </Button>
            )}
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
      <DevTool control={form.control} />
    </>
  );
}
