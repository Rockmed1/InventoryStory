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
import { updateBin } from "../../_lib/server/actions";
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
import SpinnerMini from "../_ui/server/SpinnerMini";

export default function EditBinForm({ id, onCloseModal }) {
  const queryClient = useQueryClient();

  const {
    data: [binToEdit],
    isLoading: binLoading,
    isError: binDataError,
  } = useClientData({ entity: "bin", id });

  const {
    schema,
    isLoading: loadingValidation,
    isError,
    debug,
  } = useValidationSchema({
    entity: "bin",
    operation: "update",
    editedEntityId: id,
  });

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    updateBin,
    initialState,
  );

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: "onBlur",
    defaultValues: {
      idField: binToEdit?.idField || "",
      nameField: binToEdit?.nameField || "",
      descField: binToEdit?.descField || "",
      locationId: binToEdit?.locationId || "",
    },
    shouldUnregister: true,
  });

  const mutation = useMutation({
    onMutate: async (values) => {
      const locationName = queryClient
        .getQueryData(["location", "all"])
        .find((_) => _.idField.toString() == values.locationId)?.nameField;

      await queryClient.cancelQueries({ queryKey: ["bin"] });

      const previousValues = queryClient.getQueryData(["bin", "all"]);

      queryClient.setQueryData(["bin", "all"], (old = []) =>
        old.map((bin) => {
          if (bin.idField === values.idField) {
            return {
              ...bin,
              nameField: values.nameField,
              descField: values.descField,
              locationId: values.locationId,
              locationName: locationName ?? "Fetching...",
            };
          }
          return bin;
        }),
      );

      return { previousValues };
    },

    mutationFn: async (values) => {
      const formData = createFormData(values);
      const result = await updateBin(null, formData);

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
        queryKey: ["bin"],
        refetchType: "active",
      });
      toast.success(`Bin ${variables.nameField} was updated successfully!`);
      form.reset();
      onCloseModal?.();
    },

    onError: (error, variables, context) => {
      if (context?.previousValues) {
        queryClient.setQueryData(["bin", "all"], context.previousValues);
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
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <DropDown
                      field={field}
                      entity="location"
                      name="locationId"
                      label="location"
                    />
                  </FormControl>
                  <FormDescription>Select a location.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bin Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Bin name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a unique name for the bin
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
                  <FormLabel>Bin Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Bin description" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a description for the bin
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3">
              {loadingValidation || !schema ? null : (
                <Button
                  disabled={
                    binLoading || mutation.isPending || !form.formState.isValid
                  }
                  variant="outline"
                  type="submit">
                  {mutation.isPending && <SpinnerMini />}
                  <span> Update Bin</span>
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
