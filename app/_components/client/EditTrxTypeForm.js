"use client";

import useClientData from "@/app/_lib/data/client/useClientData";
import { useClientValidationSchema } from "@/app/_lib/validation/client/useClientValidationSchema";
import { createFormData, generateQueryKeys } from "@/app/_utils/helpers";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateTrxType } from "../../_lib/data/server/actions";
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

export default function EditTrxTypeForm({ id, onCloseModal }) {
  const queryClient = useQueryClient();

  const {
    data: [trxTypeToEdit],
    isLoading: trxTypeLoading,
    isError: trxTypeDataError,
  } = useClientData({ entity: "trxType", id });

  const {
    schema,
    isLoading: loadingValidation,
    isError,
    debug,
  } = useClientValidationSchema({
    entity: "trxType",
    operation: "update",
    editedEntityId: id,
  });

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    updateTrxType,
    initialState,
  );
  console.log("⚠️ trxTypeToEdit: ", trxTypeToEdit);

  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    mode: "onBlur",
    defaultValues: {
      idField: trxTypeToEdit?.idField || "",
      nameField: trxTypeToEdit?.nameField || "",
      descField: trxTypeToEdit?.descField || "",
      trxDirectionId: trxTypeToEdit?.trxDirectionId || "",
    },
    shouldUnregister: true,
  });

  const dataParams = { entity: "trxType", id: "all" };
  const cancelDataParams = { entity: "trxType" };

  const mutation = useMutation({
    onMutate: async (values) => {
      const trxDirectionName = queryClient
        .getQueryData(generateQueryKeys({ entity: "trxDirection", id: "all" }))
        .find((_) => _.idField.toString() == values.trxDirectionId)?.nameField;

      await queryClient.cancelQueries({
        queryKey: generateQueryKeys(cancelDataParams),
      });

      const previousValues = queryClient.getQueryData(
        generateQueryKeys(dataParams),
      );

      queryClient.setQueryData(generateQueryKeys(dataParams), (old = []) =>
        old.map((trxType) => {
          if (trxType.idField === values.idField) {
            return {
              ...trxType,
              nameField: values.nameField,
              descField: values.descField,
            };
          }
          return trxType;
        }),
      );

      return { previousValues };
    },

    mutationFn: async (values) => {
      const formData = createFormData(values);
      const result = await updateTrxType(null, formData);

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
        queryKey: generateQueryKeys(cancelDataParams),
        refetchType: "active",
      });
      toast.success(
        `Transaction Type ${variables.nameField} was updated successfully!`,
      );
      form.reset();
      onCloseModal?.();
    },

    onError: (error, variables, context) => {
      if (context?.previousValues) {
        queryClient.setQueryData(
          generateQueryKeys(dataParams),
          context.previousValues,
        );
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
              name="trxDirectionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Direction</FormLabel>
                  <FormControl>
                    <DropDown
                      field={field}
                      entity="trxDirection"
                      name="trxDirectionId"
                      label="transaction direction"
                      disabled={true}
                    />
                  </FormControl>
                  <FormDescription>
                    Select the transaction direction
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nameField"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transaction Type Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Transaction Type name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a unique name for the transaction type
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
                  <FormLabel>Transaction Type Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Transaction Type description"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a description for the transaction type
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3">
              {loadingValidation || !schema ? null : (
                <Button
                  disabled={
                    trxTypeLoading ||
                    mutation.isPending ||
                    !form.formState.isValid
                  }
                  variant="outline"
                  type="submit">
                  {mutation.isPending && <SpinnerMini />}
                  <span> Update Transaction Type</span>
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
