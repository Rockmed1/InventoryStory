"use client";

import { createFormData } from "@/app/_utils/helpers";
import { DevTool } from "@hookform/devtools";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useActionState, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { createItemTrx } from "../../_lib/server/actions";
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
import SpinnerMini from "../_ui/server/SpinnerMini";

export default function AddItemTrxForm({ onCloseModal }) {
  //
  //! making this function JS only without fallback for now !//

  const queryClient = useQueryClient();

  // Get validation schema with refreshed validation data
  // const {
  //   schema,
  //   isLoading: loadingValidation,
  //   isError,
  //   debug,
  // } = useValidationSchema({ entity: "itemTrx", operation: "create" });

  //3- server action fallback for progressive enhancement (works withour JS)
  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    createItemTrx,
    initialState,
  );

  //4- Enhanced form management (JS available)
  const form = useForm({
    // resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      itemTrxHeader: {
        trxTypeId: null,
        dateField: new Date(),
        marketId: null,
        descField: null,
        numOfLines: "1",
      },
      itemTrxDetails: [
        {
          trxLineNum: "1",
          descField: "",
          itemId: null,
          fromBin: null,
          toBin: null,
          qtyIn: 0,
          qtyOut: 0,
        },
      ],
    },
    mode: "onBlur", //onTouched
  });

  //for dynamic details lines
  const fieldArray = useFieldArray({
    control: form.control,
    name: "itemTrxDetails",
  });

  function addDetailLine() {
    fieldArray.append({
      trxLineNum: (fieldArray.fields.length + 1).toString(),
      descField: "",
      itemId: "",
      fromBin: null,
      toBin: null,
      qtyIn: 0,
      qtyOut: 0,
    });
  }

  function removeDetailLine(index) {
    console.log(fieldArray.fields.length);
    console.log(index);
    // fieldArray.remove(index);
    fieldArray.fields.length > 1 && fieldArray.remove(index);
  }

  //automatically get the number of lines
  useEffect(() => {
    form.setValue(
      "itemTrxHeader.numOfLines",
      fieldArray.fields.length.toString(),
    );
  }, [fieldArray.fields.length, form]);

  //5- Enhanced Mutation  (JS available)
  //! maybe extract into cusom hook

  const mutation = useMutation({
    mutationFn: async (data) => {
      //Convert RHF data to FormData for server action compatibility (incase js is unavailable the default data passed is formData. if only js then this conversion will not be needed )
      const formData = createFormData(data);

      //Call server action directly
      const result = await createItemTrx(null, formData);

      //Transform server action response for mutation
      if (!result.success) {
        const error = new Error(result.message || "Server error occurred");
        error.zodErrors = result.zodErrors;
        error.message = result.message;
        // error.formData = result.formData;
        throw error;
      }

      return result;
    },

    // Optimistic update:
    onMutate: async (newItemTrx) => {
      //cancel ongoing refetches for all tags including "bin"
      await queryClient.cancelQueries({ queryKey: ["itemTrx"] });

      //Snapshot previous values
      const previousValues = queryClient.getQueryData(["itemTrx", "all"]);

      const tempId = `temp-${Date.now()}`;
      //optimistically update cache
      queryClient.setQueryData(["itemTrx", "all"], (old = []) => [
        ...old,
        { ...newItemTrx, idField: tempId, optimistic: true },
      ]);

      return { previousValues };
    },

    //Success Handling
    onSuccess: (result, variables) => {
      //Replace optimistic update with real data
      // queryClient.setQueryData(["bin"], (old = []) =>
      //   old.map((bin) =>
      //     bin.optimistic && bin.nameField === variables.item_name
      //       ? { ...result.formData,idField: result.idField }
      //       : bin,
      //   ),
      // );

      //! may be should refetch
      queryClient.invalidateQueries({
        queryKey: ["bin"],
        refetchType: "none", //don't show loading state
      });
      //UI feedback //! may be grab the newly created id here...
      toast.success(`Bin ${variables.nameField} was created successfully!`);
      form.reset();
      onCloseModal?.();
    },

    //Error Handling (JS Enhanced)
    onError: (error, variables, context) => {
      //Roll back optimistic update
      if (context?.previousValues) {
        queryClient.setQueryData(["bin", "all"], context.previousValues);
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
        // toast.error(error.message || "Failed to create bin");
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
    console.log("🎪 AddItemTrxForm was submitted with data: ", data);

    // 🎯 BINARY DECISION: JavaScript Available & Mutation Ready?
    const isJavaScriptReady =
      mutation && !mutation.isPending && typeof mutation.mutate === "function";

    if (isJavaScriptReady) {
      // ✅ YES: Enhanced Submission
      e.preventDefault();
      // mutation.mutate(data);
      console.log("🎪 AddItemTrxForm was submitted with data: ", data);
    }
    // ❌ NO: Native Form Submission (let it proceed naturally)
  }

  // Don't render form until schema is loaded and itemToEdit is available  │
  // if (loadingValidation || !schema) {
  //   return <div>Loading form...</div>;
  // }

  return (
    <>
      {
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            // action={formAction}
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

            <div className="TrxHeader mb-6 rounded-lg bg-neutral-50 p-4">
              <h3 className="mb-4 text-lg font-semibold text-neutral-700">
                Transaction Header
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="itemTrxHeader.trxTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Type * </FormLabel>
                      <FormControl>
                        <DropDown
                          field={field}
                          entity="trxType"
                          name="itemTrxHeader.trxTypeId"
                          // label="location"
                        />
                      </FormControl>
                      <FormDescription>
                        Select a transaction type.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="itemTrxHeader.dateField"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          name="itemTrxHeader.dateField"
                          field={field}
                        />
                      </FormControl>
                      <FormDescription>
                        Select a transaction date.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="itemTrxHeader.marketId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Market</FormLabel>
                      <FormControl>
                        <DropDown
                          field={field}
                          entity="market"
                          name="itemTrxHeader.marketId"
                          // label="location"
                        />
                      </FormControl>
                      <FormDescription>Select markets</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="itemTrxHeader.descField"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transaction description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter Trx description"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="itemTrxHeader.numOfLines"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} type="hidden" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Transaction Details */}
              <div className="mb-6 rounded-lg bg-neutral-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-700">
                    Transaction Details ({fieldArray.fields.length} lines)
                  </h3>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addDetailLine}>
                    Add Line
                  </Button>
                </div>

                <div className="overflow-scroll">
                  {fieldArray.fields.map((_, index) => (
                    <div
                      key={index}
                      className="mb-4 rounded-lg border border-neutral-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <h4 className="font-medium text-neutral-600">
                          Line {index + 1}
                        </h4>
                        {fieldArray.fields.length > 1 && (
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => removeDetailLine(index)}>
                            -
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <FormField
                          control={form.control}
                          name={`itemTrxDetails.${index}.itemId`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Item</FormLabel>
                              <FormControl>
                                <DropDown
                                  field={field}
                                  entity="item"
                                  name={`itemTrxDetails.${index}.itemId`}
                                  // label="location"
                                />
                              </FormControl>
                              <FormDescription>Select item</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`itemTrxDetails.${index}.fromBin`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>From Bin</FormLabel>
                              <FormControl>
                                <DropDown
                                  field={field}
                                  entity="bin"
                                  name={`itemTrxDetails.${index}.fromBin`}
                                  // label="location"
                                />
                              </FormControl>
                              <FormDescription>Select from Bin</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`itemTrxDetails.${index}.qtyIn`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qty In</FormLabel>
                              <FormControl>
                                <Input placeholder="0" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`itemTrxDetails.${index}.toBin`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>To Bin</FormLabel>
                              <FormControl>
                                <DropDown
                                  field={field}
                                  entity="bin"
                                  name={`itemTrxDetails.${index}.toBin`}
                                  // label="location"
                                />
                              </FormControl>
                              <FormDescription>Select To Bin</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`itemTrxDetails.${index}.qtyOut`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qty Out</FormLabel>
                              <FormControl>
                                <Input placeholder="0" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name={`itemTrxDetails.${index}.descField`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Line Description</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter line description"
                                  {...field}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                {/* {loadingValidation || !schema ? null : ( */}
                <Button
                  // disabled={mutation.isPending || !form.formState.isValid}
                  variant="outline"
                  type="submit">
                  {mutation.isPending && <SpinnerMini />}
                  <span> Create Transaction</span>
                </Button>
                {/* )} */}
                <Button
                  type="button"
                  onClick={onCloseModal}
                  variant="destructive"
                  disabled={mutation.isPending}>
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </Form>
      }
      <DevTool control={form.control} />
    </>
  );
}
