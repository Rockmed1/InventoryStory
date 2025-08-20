"use client";

import { useValidationSchema } from "@/app/_hooks/useValidationSchema";
import useClientData from "@/app/_lib/client/useClientData";
import { createFormData, generateQueryKeys } from "@/app/_utils/helpers";
import { DevTool } from "@hookform/devtools";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const {
    schema,
    isLoading: loadingValidation,
    errors: validationErrors,
    isError,
    debug,
  } = useValidationSchema({ entity: "itemTrx", operation: "create" });

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
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      itemTrxHeader: {
        trxTypeId: null,
        dateField: new Date(),
        marketId: null,
        descField: "",
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
    // console.log(fieldArray.fields.length);
    // console.log(index);
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

  // const trxTypeId = form.watch("itemTrxHeader.trxTypeId");
  // // const { directionId, setDirectionId } = useState(null)
  // const { data } = useClientData({
  //   entity: "trxType",
  //   id: trxTypeId,
  // });

  // const { trxDirectionId } = data[0];
  // console.log("watch trxTypeId: ", trxTypeId, "directionId: ", trxDirectionId);

  // useEffect(() => {}, [trxTypeId]);

  //5- Enhanced Mutation  (JS available)
  //! maybe extract into cusom hook
  const dataParams = { entity: "itemTrx", id: "all" };
  const cancelDataParams = { entity: "itemTrx" };

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
      //cancel ongoing refetches for all tags including "itemTrx"
      await queryClient.cancelQueries({
        queryKey: generateQueryKeys(cancelDataParams),
      });

      //Snapshot previous values
      const previousValues = queryClient.getQueryData(
        generateQueryKeys(dataParams),
      );

      const tempId = `temp-${Date.now()}`;
      //optimistically update cache
      queryClient.setQueryData(generateQueryKeys(dataParams), (old = []) => [
        ...old,
        { ...newItemTrx, idField: tempId, optimistic: true },
      ]);

      return { previousValues };
    },

    //Success Handling
    onSuccess: (result, variables) => {
      //Replace optimistic update with real data
      // queryClient.setQueryData(["itemTrx"], (old = []) =>
      //   old.map((itemTrx) =>
      //     itemTrx.optimistic && itemTrx.nameField === variables.item_name
      //       ? { ...result.formData,idField: result.idField }
      //       : itemTrx,
      //   ),
      // );

      //! may be should refetch
      queryClient.invalidateQueries({
        queryKey: generateQueryKeys(cancelDataParams),
        refetchType: "none", //don't show loading state
      });
      //UI feedback //! may be grab the newly created id here...
      toast.success(`Transaction was created successfully!`);
      form.reset();
      onCloseModal?.();
    },

    //Error Handling (JS Enhanced)
    onError: (error, variables, context) => {
      //Roll back optimistic update
      if (context?.previousValues) {
        queryClient.setQueryData(
          generateQueryKeys(dataParams),
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
        // toast.error(error.message || "Failed to create itemTrx");
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
    }
    // ❌ NO: Native Form Submission (let it proceed naturally)
  }

  // Don't render form until schema is loaded and itemToEdit is available
  //TODO: make this better: may be render the form anyways but put a message in the form top...
  // console.log("📝 AddItemTrxForm", {
  //   isError,
  //   validationErrors,
  //   "isValid: ": form.formState.isValid,
  //   "valiues: ": form.formState.values,
  // });

  // console.log("📝 AddItemTrxForm DETAILED DEBUG", {
  //   loadingValidation,
  //   isValid: form.formState.isValid,
  //   errors: form.formState.errors,
  //   touchedFields: form.formState.touchedFields,
  //   dirtyFields: form.formState.dirtyFields,
  //   isValidating: form.formState.isValidating,
  //   submitCount: form.formState.submitCount,
  //   // Check each field's validation state
  //   fieldStates: Object.keys(form.getValues()).map((fieldName) => ({
  //     field: fieldName,
  //     value: form.getValues(fieldName),
  //     error: form.formState.errors[fieldName],
  //     touched: form.formState.touchedFields[fieldName],
  //     dirty: form.formState.dirtyFields[fieldName],
  //   })),
  // });

  // console.log("📝 Deep error check:", {
  //   rootErrors: form.formState.errors,
  //   headerErrors: form.formState.errors.itemTrxHeader,
  //   detailsErrors: form.formState.errors.itemTrxDetails,
  //   allFormErrors: form.formState.errors,
  //   // Check if there are any error keys we're missing
  //   errorKeys: Object.keys(form.formState.errors),
  //   nestedErrorCheck: JSON.stringify(form.formState.errors, null, 2),
  // });

  // console.log("📝 Root error debug:", {
  //   rootError: form.formState.errors.root,
  //   rootErrorType: typeof form.formState.errors.root,
  //   rootErrorKeys: form.formState.errors.root
  //     ? Object.keys(form.formState.errors.root)
  //     : null,
  //   allErrorsStringified: JSON.stringify(form.formState.errors, null, 2),
  // });

  // const allErrors = form.formState.errors;
  // console.log("📝 All error keys:", Object.keys(allErrors));
  // console.log("📝 Stringified errors:", JSON.stringify(allErrors, null, 2));

  console.log("📝 form state: ", form.formState);

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
            // action={formAction}
            // method="POST"
            className="space-y-8">
            {/* Global error display */}
            {(mutation.error?.message ||
              form.formState.errors?.root ||
              formState?.message) && (
              <div className="error-banner rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {typeof form.formState.errors.root === "string"
                  ? form.formState.errors.root
                  : form.formState.errors.root.message ||
                    formState?.message ||
                    "Validation error occurred"}
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
                        <FormMessage />
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
                              <FormMessage />
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
                              <FormMessage />
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                {loadingValidation || !schema ? null : (
                  <Button
                    disabled={mutation.isPending || !form.formState.isValid}
                    variant="outline"
                    type="submit">
                    {mutation.isPending && <SpinnerMini />}
                    <span> Create Transaction</span>
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={onCloseModal}
                  variant="destructive"
                  disabled={mutation.isPending}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={async () => {
                    console.log("Manual validation check:");
                    const result = await form.trigger(); // Validate all fields
                    console.log("Trigger result:", result);
                    console.log("Form state after trigger:", {
                      isValid: form.formState.isValid,
                      errors: form.formState.errors,
                    });
                  }}>
                  Test Validation
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
