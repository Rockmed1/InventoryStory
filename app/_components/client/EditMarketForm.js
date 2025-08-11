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
import { updateMarket } from "../../_lib/server/actions";
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

export default function EditMarketForm({ id, onCloseModal }) {
  const queryClient = useQueryClient();

  const {
    data: [marketToEdit],
    isLoading: marketLoading,
    isError: marketDataError,
  } = useClientData({ entity: "market", id });

  const {
    schema,
    isLoading: loadingValidation,
    isError,
    debug,
  } = useValidationSchema({
    entity: "market",
    operation: "update",
    editedEntityId: id,
  });

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    updateMarket,
    initialState,
  );

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: "onBlur",
    defaultValues: {
      idField: marketToEdit?.idField || "",
      nameField: marketToEdit?.nameField || "",
      descField: marketToEdit?.descField || "",
      urlField: marketToEdit?.urlField || "",
      marketTypeId: marketToEdit?.marketTypeId || "",
    },
    shouldUnregister: true,
  });

  const mutation = useMutation({
    onMutate: async (values) => {
      const marketTypeName = queryClient
        .getQueryData(["marketType", "all"])
        .find((_) => _.idField.toString() == values.marketTypeId)?.nameField;

      await queryClient.cancelQueries({ queryKey: ["market"] });

      const previousValues = queryClient.getQueryData(["market", "all"]);

      queryClient.setQueryData(["market", "all"], (old = []) =>
        old.map((market) => {
          if (market.idField === values.idField) {
            return {
              ...market,
              nameField: values.nameField,
              descField: values.descField,
              urlField: values.urlField,
              marketTypeId: values.marketTypeId,
              marketTypeName: marketTypeName ?? "Fetching...",
            };
          }
          return market;
        }),
      );

      return { previousValues };
    },

    mutationFn: async (values) => {
      const formData = createFormData(values);
      const result = await updateMarket(null, formData);

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
        queryKey: ["market"],
        refetchType: "active",
      });
      toast.success(`Market ${variables.nameField} was updated successfully!`);
      form.reset();
      onCloseModal?.();
    },

    onError: (error, variables, context) => {
      if (context?.previousValues) {
        queryClient.setQueryData(["market", "all"], context.previousValues);
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
              name="marketTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market Type</FormLabel>
                  <FormControl>
                    <DropDown
                      field={field}
                      entity="marketType"
                      name="marketTypeId"
                      label="market type"
                    />
                  </FormControl>
                  <FormDescription>Select a market type.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Market name" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a unique name for the market
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
                  <FormLabel>Market Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Market description" {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a description for the market
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="urlField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Market URL" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the website URL for the market
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3">
              {loadingValidation || !schema ? null : (
                <Button
                  disabled={
                    marketLoading ||
                    mutation.isPending ||
                    !form.formState.isValid
                  }
                  variant="outline"
                  type="submit">
                  {mutation.isPending && <SpinnerMini />}
                  <span> Update Market</span>
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
