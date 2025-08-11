"use client";

import { useValidationSchema } from "@/app/_hooks/useValidationSchema";
import { createFormData } from "@/app/_utils/helpers";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { createMarketType } from "../../_lib/server/actions";
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
import SpinnerMini from "../_ui/server/SpinnerMini";

export default function AddMarketTypeForm({ onCloseModal }) {
  const queryClient = useQueryClient();

  // 2- get the validation schema with refreshed validation data
  const {
    schema,
    isLoading: loadingValidation,
    isError,
    debug,
  } = useValidationSchema({ entity: "marketType", operation: "create" });

  //3- server action fallback for progressive enhancement (works withour JS)
  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    createMarketType,
    initialState,
  );

  //4- Enhanced form management (JS available)
  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      nameField: "",
      descField: "",
    },
    mode: "onBlur", //onTouched
  });

  //5- Enhanced Mutation  (JS available)
  //! maybe extract into cusom hook

  const mutation = useMutation({
    mutationFn: async (data) => {
      //Convert RHF data to FormData for server action compatibility (incase js is unavailable the default data passed is formData. if only js then this conversion will not be needed )
      const formData = createFormData(data);

      //Call server action directly
      const result = await createMarketType(null, formData);

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

    // Optimistic update
    onMutate: async (newMarketType) => {
      await queryClient.cancelQueries({ queryKey: ["marketType"] });

      const previousValues = queryClient.getQueryData(["marketType", "all"]);

      // Optimistically update cache
      queryClient.setQueryData(["marketType", "all"], (old = []) => [
        ...old,
        {
          idField: Date.now(), // Temporary ID
          nameField: newMarketType.nameField,
          descField: newMarketType.descField,
          optimistic: true,
        },
      ]);

      return { previousValues };
    },

    //Success Handling
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["marketType"],
        refetchType: "none",
      });

      toast.success(
        `Market Type ${variables.nameField} was created successfully!`,
      );
      form.reset();
      onCloseModal?.();
    },

    //Error Handling (JS Enhanced)
    onError: (error, variables, context) => {
      //Roll back optimistic update
      if (context?.previousValues) {
        queryClient.setQueryData(["marketType", "all"], context.previousValues);
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
    // console.log("Form submitted: ", data);

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

  // Don't render form until schema is loaded and itemToEdit is available  │
  if (loadingValidation || !schema) {
    return <div>Loading form...</div>;
  }

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
              name="nameField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market Type Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Market Type name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a unique name for the market type
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market Type Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Market Type description"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a description for the market type
                  </FormDescription>
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
                  <span>Add Market Type</span>
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
