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

  // console.log("AddItemForm debug useClientValidationSchema: ", debug);

  // console.log("AddItemForm schema: ", schema);
  // console.log("AddItemForm schema loadingValidation?: ", loadingValidation);
  // console.log("Validation hook isError:", isError);
  // console.log("Validation hook debug info:", debug);

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
  useEffect(() => {
    const mutationKey = generateQueryKeys(dataParams);
    console.log("🔑 AddItemForm query key:", mutationKey);
    console.log("🔑 AddItemForm dataParams:", dataParams);
  }, []);

  //5- Enhanced Mutation  (JS available)
  //! maybe extract into cusom hook

  const dataParams = { entity: "item", id: "all" };
  const cancelDataParams = { entity: "item" };

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
        error.message = result.message;
        // error.formData = result.formData;
        throw error;
      }

      return result;
    },

    // Optimistic update:
    onMutate: async (newItem) => {
      //cancel ongoing refetches for all tags including "item"
      // console.log("🔄 Starting optimistic update for:", newItem);

      await queryClient.cancelQueries({
        queryKey: generateQueryKeys(cancelDataParams),
      });

      //Snapshot previous values
      const previousValues = queryClient.getQueryData(
        generateQueryKeys(dataParams),
      );
      // console.log("📸 Previous values:", previousValues);
      //optimistically update cache

      const optimisticItem = {
        ...newItem,
        idField: `temp-${Date.now()}`,
        optimistic: true,
      };

      // console.log("✨ Adding optimistic item:", optimisticItem);

      // Optimistically update cache
      queryClient.setQueryData(generateQueryKeys(dataParams), (old = []) => {
        const newData = [...old, optimisticItem];
        console.log("🎯 New cache data:", newData);
        return newData;
      });

      return { previousValues };
    },

    //Success Handling
    onSuccess: (result, variables) => {
      //Replace optimistic update with real data
      // queryClient.setQueryData(["item"], (old = []) =>
      //   old.map((item) =>
      //     item.optimistic && item.nameField === variables.item_name
      //       ? { ...result.formData,idField: result.idField }
      //       : item,
      //   ),
      // );

      //! may be should refetch
      queryClient.invalidateQueries({
        queryKey: generateQueryKeys({ entity: "item" }),
        refetchType: "active", //don't show loading state
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
        queryClient.setQueryData(
          generateQueryKeys({ entity: "item", id: "all" }),
          context.previousValues,
        );
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
        // may be put this message on the top of the form
        // toast.error("Please fix the validation errors");
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
        // toast.error(error.message || "Failed to create item");
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

  //6- Progressive enhancement submit handler

  function onSubmit(data, e) {
    // console.log("🎪 AddItemForm was submitted with data: ", data);
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

  // console.log("AddItemForm validation errors:", validationErrors);

  // console.log("📝 Deep error check:", {
  //   rootErrors: form.formState.errors,
  //   headerErrors: form.formState.errors.itemTrxHeader,
  //   detailsErrors: form.formState.errors.itemTrxDetails,
  //   allFormErrors: form.formState.errors,
  //   // Check if there are any error keys we're missing
  //   errorKeys: Object.keys(form.formState.errors),
  //   nestedErrorCheck: JSON.stringify(form.formState.errors, null, 2),
  // });

  // Don't render form until schema is loaded and itemToEdit is available
  //TODO: make this better: may be render the form anyways but put a message in the form top...

  if (loadingValidation || !schema) {
    // if (loadingValidation ) {
    return <div>Loading form...</div>;
  }

  // if (validationErrors) form.setError("root");
  return (
    <>
      {
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            action={formAction}
            // method="POST"
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
                  <FormDescription>Enter new item name</FormDescription>
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
      }
      <DevTool control={form.control} />
    </>
  );
}
