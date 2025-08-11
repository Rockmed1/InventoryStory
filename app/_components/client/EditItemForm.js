"use client";

import { useValidationSchema } from "@/app/_hooks/useValidationSchema";
import { createFormData } from "@/app/_utils/helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateItem } from "../../_lib/server/actions";
import { DropDown } from "../_ui/client/DropDown";
// import Button from "../_ui/server/Button";
import useClientData from "@/app/_hooks/useClientData";
import { DevTool } from "@hookform/devtools";
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

/**
 * A form for editing an existing item, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Object} itemToEdit - The item object to edit
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function EditItemForm({ id, onCloseModal }) {
  const queryClient = useQueryClient();
  // the id will be passed from the cloneElement in the Modal

  // console.log("EditItemFormidField: ", id);
  // Get existing items from the store for validation
  const {
    data: [itemToEdit],
    isLoading: itemLoading,
    isError: itemDataError,
  } = useClientData({ entity: "item", id });

  console.log("EditItemForm received itemToEdit:", {
    id,
    itemToEdit,
    isArray: Array.isArray(itemToEdit),
    type: typeof itemToEdit,
    itemDataError,
  });

  // 2- get the validation schema with refreshed validation data
  const {
    schema,
    isLoading: loadingValidation,
    isError,
    debug,
  } = useValidationSchema({
    entity: "item",
    operation: "update",
    editedEntityId: id,
  });

  // console.log("EditItemForm schema: ", schema);
  // console.log("EditItemForm schema loadingValidation?: ", loadingValidation);
  // console.log("Validation hook isError:", isError);
  // console.log("Validation hook debug info:", debug);

  //3- server action fallback for progressive enhancement (works withour JS)
  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    updateItem,
    initialState,
  );

  //4- Enhanced form management (JS available)
  // const { apiOnlyData, restoreDefaultFormat, isChanged } =
  //   entityTransformers("item").editForm;

  // //4-a customize the resolver to handle the custom form data:
  // const customZodResolver = (schema) => {
  //   //This is the first stop for the form data before it the onSubmit is fired up. the returned validated data is what the onSubmit will see.
  //   const baseResolver = zodResolver(schema);
  //   return async (data, context, options) => {
  //     // Extract itemClassName from raw form data
  //     const itemClassName = data.itemClass?.name;
  //     // Transform data before validation
  //     const transformedData = apiOnlyData(data);
  //     // Run the validation on the transformed data
  //     const validationResults = await baseResolver(
  //       transformedData,
  //       context,
  //       options,
  //     );
  //     // if validation is successful attach the itemClassName back
  //     if (
  //       !validationResults.errors ||
  //       Object.keys(validationResults.errors).length === 0
  //     ) {
  //       return {
  //         ...restoreDefaultFormat(validationResults.values, itemClassName),
  //         errors: {},
  //       };
  //     }
  //     return { errors: validationResults.errors };
  //   };
  // };

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: "onBlur", //onTouched
    defaultValues: {
      idField: itemToEdit?.idField || "",
      itemClassId: itemToEdit?.itemClassId || "",
      nameField: itemToEdit?.nameField || "",
      descField: itemToEdit?.descField || "",
    },
    shouldUnregister: true,
  });

  //5- Enhanced Mutation  (JS available)
  //! maybe extract into cusom hook

  const mutation = useMutation({
    // 1- Optimistic update: this fires first before the mutation function
    onMutate: async (values) => {
      // here we use the raw form data without transformation to have access to the itemClassName
      console.log("editForm onMutate data: ", values);
      //cancel ongoing refetches for all tags including "item"

      const itemClassName = queryClient
        .getQueryData(["itemClass", "all"])
        .find((_) => _.idField.toString() == values.itemClassId)?.nameField;

      await queryClient.cancelQueries({ queryKey: ["item"] });

      //Snapshot previous values
      const previousValues = queryClient.getQueryData(["item", "all"]);

      //optimistically update cache
      queryClient.setQueryData(["item", "all"], (old = []) =>
        old.map((item) => {
          if (item.idField === values.idField) {
            return {
              ...item,
              nameField: values.nameField,
              descField: values.descField,
              itemClassId: values.itemClassId,
              itemClassName: itemClassName ?? "Fetching...",
            };
          }
          return item;
        }),
      );

      return { previousValues };
    },

    //2- actual mutation function
    mutationFn: async (values) => {
      //massage data to remove the itemClassName
      // const massagedData = apiOnlyData(values);

      // console.log("editForm mutationFn raw data: ", values);

      // console.log("editForm mutationFn data: ", massagedData);
      //Convert RHF data to FormData for server action compatibility (incase js is unavailable the default data passed is formData. if only js then this conversion will not be needed )
      const formData = createFormData(values);

      //Call server action directly
      const result = await updateItem(null, formData);

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

    //3-Success Handling
    onSuccess: (result, variables) => {
      //Replace optimistic update with real data
      // queryClient.setQueryData(
      //   ["item", "all"],
      //   (old = []) =>
      //     old.map((item) =>
      //       item.optimistic && variables.idField === item.idField
      //         ? { ...result.data }
      //         : // : item.optimistic
      //           //   ? undefined
      //           item,
      //     ),
      //   // .filter(Boolean),
      // );

      console.log("onSuccess result data:", result.data);
      // Also update the specific item cache
      // queryClient.setQueryData(["item", result.data.id], result.data);

      //! may be should refetch
      queryClient.invalidateQueries({
        queryKey: ["item"],
        refetchType: "active", //refetch immediately all active item queries
      });
      // Remove the cache entirely, forcing fresh fetch
      // queryClient.removeQueries({ queryKey: ["item"] });

      //UI feedback
      // //! may be grab the newly created id here...
      toast.success(`Item ${variables.nameField} was updated successfully!`);
      form.reset();
      onCloseModal?.();
    },

    //4- Error Handling (JS Enhanced)
    onError: (error, variables, context) => {
      //Roll back optimistic update
      if (context?.previousValues) {
        queryClient.setQueryData(["item", "all"], context.previousValues);
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

        console.log("🚨 error: ", error);
        form.setError("root", {
          type: "server",
          message: error.message || "An unexpected error occured",
        });
      }
    },

    //5- retry logic
    retry: (failureCount, error) => {
      //Retry network errors but not validation errors
      return error.name === "NetworkError" && failureCount < 3;
    },
  });

  //6- Progressive enhancement submit handler
  function onSubmit(values, e) {
    console.log("editForm submitted: ", values);

    // 🎯 BINARY DECISION: JavaScript Available & Mutation Ready?
    const isJavaScriptReady =
      mutation && !mutation.isPending && typeof mutation.mutate === "function";

    if (isJavaScriptReady) {
      // ✅ YES: Enhanced Submission
      e.preventDefault();

      // if (!isChanged(itemToEdit, values)) {
      //   toast.error("No changes detected");
      //   return;
      // }

      mutation.mutate(values);
    }
    // ❌ NO: Native editForm Submission (let it proceed naturally)
  }
  // console.log("EditItem editForm debug:", {
  //   formState: form.formState,
  //   // formValues: form.getValues(),
  //   // itemToEdit: itemToEdit,
  //   // formDefaultValues: form.formState.defaultValues,
  //   // isDirty: form.formState.isDirty,
  //   // errors: {
  //   //   "mutation.error?.message": mutation.error?.message,
  //   //   "form.formState.errors?.root": form.formState.errors?.root,
  //   //   "form.formState?.message": form.formState?.message,
  //   // },
  // });

  // useEffect(() => {
  //   console.log("📊 editForm state changed:", {
  //     isValid: form.formState.isValid,
  //     statuses: {
  //       itemLoading: itemLoading,
  //       "mutation.isPending": mutation.isPending,
  //       "!form.formState.isValid": !form.formState.isValid,
  //     },

  //     errors: {
  //       "mutation.error": mutation.error,
  //       "form.formState?.message": form.formState?.message,
  //       "form.formState.errors": form.formState.errors,
  //     },
  //     isDirty: form.formState.isDirty,
  //     values: form.getValues(),
  //   });
  // }, [form.formState.isValid, form.formState.errors]);

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
              form.formState?.message) && (
              <div className="error-banner rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {form.formState.errors.root?.message ||
                  formState?.message ||
                  mutation.error?.message}
              </div>
            )}

            {/* Hidden field for ID */}
            <input type="hidden" {...form.register("idField")} />

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
                      // form={form}
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
                    <Input placeholder={itemToEdit?.name} {...field} />
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
              {loadingValidation || !schema ? null : (
                <Button
                  disabled={
                    itemLoading || mutation.isPending || !form.formState.isValid
                  }
                  variant="outline"
                  type="submit">
                  {mutation.isPending && <SpinnerMini />}
                  <span> Update Item</span>
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
