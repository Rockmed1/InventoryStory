"use client";

import useClientData from "@/app/_hooks/useClientData";
import { useValidationSchema } from "@/app/_hooks/useValidationSchema";
import { createFormData } from "@/app/_utils/helpers";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateLocation } from "../../_lib/server/actions";
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

export default function EditLocationForm({ id, onCloseModal }) {
  const queryClient = useQueryClient();

  const {
    data: [locationToEdit],
    isLoading: locationLoading,
    isError: locationDataError,
  } = useClientData({ entity: "location", id });

  const {
    schema,
    isLoading: loadingValidation,
    isError,
    debug,
  } = useValidationSchema({
    entity: "location",
    operation: "update",
    editedEntityId: id,
  });

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    updateLocation,
    initialState,
  );

  // const { apiOnlyData, restoreDefaultFormat, isChanged } =
  //   entityTransformers("location").editForm;

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: "onBlur",
    defaultValues: {
      idField: locationToEdit?.idField || "",
      nameField: locationToEdit?.nameField || "",
      descField: locationToEdit?.descField || "",
    },
    shouldUnregister: true,
  });

  const mutation = useMutation({
    onMutate: async (values) => {
      await queryClient.cancelQueries({ queryKey: ["location"] });

      const previousValues = queryClient.getQueryData(["location", "all"]);

      queryClient.setQueryData(["location", "all"], (old = []) =>
        old.map((location) => {
          if (location.idField === values.idField) {
            return {
              ...location,
              nameField: values.nameField,
              descField: values.descField,
            };
          }
          return location;
        }),
      );

      return { previousValues };
    },

    mutationFn: async (values) => {
      const formData = createFormData(values);
      const result = await updateLocation(null, formData);

      if (!result.success) {
        const error = new Error(result.message || "Server error occured");
        error.zodErrors = result.zodErrors;
        error.message = result.message;
        throw error;
      }

      return result;
    },

    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["location"],
        refetchType: "active",
      });
      toast.success(
        `Location ${variables.nameField} was updated successfully!`,
      );
      form.reset();
      onCloseModal?.();
    },

    onError: (error, variables, context) => {
      if (context?.previousValues) {
        queryClient.setQueryData(["location", "all"], context.previousValues);
      }

      if (error.zodErrors) {
        Object.entries(error.zodErrors).forEach(([field, errors]) =>
          form.setError(field, {
            type: "server",
            message: Array.isArray(errors) ? errors[0] : errors,
          }),
        );
      } else if (error.name === "NetworkError") {
        toast.error(
          "Network error. Please check your connection and try again.",
        );
        form.setError("root", {
          type: "network",
          message: "Connection failed. Please try again.",
        });
      } else {
        form.setError("root", {
          type: "server",
          message: error.message || "An unexpected error occured",
        });
      }
    },

    retry: (failureCount, error) => {
      return error.name === "NetworkError" && failureCount < 3;
    },
  });

  function onSubmit(values, e) {
    const isJavaScriptReady =
      mutation && !mutation.isPending && typeof mutation.mutate === "function";

    if (isJavaScriptReady) {
      e.preventDefault();

      // if (!isChanged(locationToEdit, values)) {
      //   toast.error("No changes detected");
      //   return;
      // }

      mutation.mutate(values);
    }
  }

  return (
    <>
      {
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            action={formAction}
            className="space-y-8">
            {(mutation.error?.message ||
              form.formState.errors?.root ||
              form.formState?.message) && (
              <div className="error-banner rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {form.formState.errors.root?.message ||
                  formState?.message ||
                  mutation.error?.message}
              </div>
            )}

            <input type="hidden" {...form.register("idField")} />

            <FormField
              control={form.control}
              name="nameField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Location name" {...field} />
                  </FormControl>
                  <FormDescription>Enter new location name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Location description"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter new location name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-3">
              {loadingValidation || !schema ? null : (
                <Button
                  disabled={
                    locationLoading ||
                    mutation.isPending ||
                    !form.formState.isValid
                  }
                  variant="outline"
                  type="submit">
                  {mutation.isPending && <SpinnerMini />}
                  <span> Update Location</span>
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
