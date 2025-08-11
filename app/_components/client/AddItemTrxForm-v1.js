"use client";

import Form from "@/app/_components/_ui/client/Form";
import { getValidationSchema } from "@/app/_lib/validation/getValidationSchema";
import { useAppStore } from "@/app/_store/AppProvider";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createItemTrx } from "../../_lib/server/actions";
import { formDataTransformer } from "../../_lib/server/transformers";
import { DropDown } from "../_ui/client/DropDown";
import DatePicker from "../_ui/client/shadcn-DatePicker";
import Button from "../_ui/server/Button";
import SpinnerMini from "../_ui/server/SpinnerMini";

/**
 * A form for adding a new item transaction, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function AddItemTrxForm({ onCloseModal }) {
  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    createItemTrx,
    initialState,
  );

  const [clientFormState, setClientFormState] = useState(initialState);
  const [detailLines, setDetailLines] = useState([{}]);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(`Item transaction has been created successfully.`);
      setClientFormState(initialState); // reset client form state
      setDetailLines([{}]); // reset detail lines
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  const addDetailLine = () => {
    setDetailLines((prev) => [...prev, {}]);
  };

  const removeDetailLine = (index) => {
    if (detailLines.length > 1) {
      setDetailLines((prev) => prev.filter((_, i) => i !== index));
    }
  };

  function handleSubmit(e) {
    e.preventDefault();

    // CLIENT VALIDATE FORM DATA
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    console.log(data);

    // Transform FormData using unified pipeline
    const transformedData = formDataTransformer.transform(formData);
    console.log("Client transformed data:", transformedData);

    // Get the validation schema with data dependencies (following current pattern)
    // Get only required existing data from the store for validation upfront
    const existingItems = useAppStore((state) => state.item || []);
    const existingBins = useAppStore((state) => state.bin || []);
    const existingMarkets = useAppStore((state) => state.market || []);
    const existingTrxTypes = useAppStore((state) => state.trxType || []);

    const dataDependencies = {
      item: existingItems,
      bin: existingBins,
      market: existingMarkets,
      trxType: existingTrxTypes,
    };

    const schema = getValidationSchema("itemTrx", dataDependencies, "create");

    // Perform combined validation
    const validationResults = schema.safeParse(transformedData);

    // If form data did not pass client validation
    if (!validationResults.success) {
      e.preventDefault();
      setClientFormState({
        success: false,
        formData: transformedData,
        zodErrors: validationResults.error.flatten().fieldErrors,
        message: "Fix these errors to proceed.",
      });
    } else {
      // If passed client validation then reset form state
      setClientFormState(initialState);
    }
  }

  console.log("Current form state:", currentFormState);

  return (
    //action={formAction}
    <Form onSubmit={handleSubmit}>
      <Form.ZodErrors
        error={formState?.["message"] || clientFormState?.message}
      />

      {/* Transaction Header */}
      <div className="mb-6 rounded-lg bg-neutral-50 p-4">
        <h3 className="mb-4 text-lg font-semibold text-neutral-700">
          Transaction Header
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Form.InputSelect
            name="_trx_header._trx_type_id"
            error={currentFormState?.zodErrors?.["_trx_header._trx_type_id"]}>
            <Form.Label>Transaction Type *</Form.Label>
            <DropDown
              entity="trxType"
              name="_trx_header._trx_type_id"
              required={true}
            />
          </Form.InputSelect>

          <DatePicker
            name="_trx_header._trx_date"
            onChange={(value) => handleHeaderChange("_trx_date", value)}
            error={currentFormState?.zodErrors?.["_trx_header._trx_date"]}
          />

          <Form.InputSelect
            name="_trx_header._market_id"
            error={currentFormState?.zodErrors?.["_trx_header._market_id"]}>
            <Form.Label>Market *</Form.Label>
            <DropDown
              entity="market"
              name="_trx_header._market_id"
              required={true}
            />
          </Form.InputSelect>
        </div>

        <div className="mt-4">
          <Form.InputWithLabel
            name="_trx_header._trx_desc"
            inputValue={currentFormState.formData?._trx_header?._trx_desc}
            placeholder="Enter trx description"
            error={currentFormState?.zodErrors?.["_trx_header._trx_desc"]}
            required>
            Transaction Description *
          </Form.InputWithLabel>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="mb-6 rounded-lg bg-neutral-50 p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-700">
            Transaction Details ({detailLines.length} lines)
          </h3>
          <Button type="button" variant="secondary" onClick={addDetailLine}>
            Add Line
          </Button>
        </div>

        <div className="overflow-scroll">
          {detailLines.map((_, index) => (
            <div
              key={index}
              className="mb-4 rounded-lg border border-neutral-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-medium text-neutral-600">
                  Line {index + 1}
                </h4>
                {detailLines.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => removeDetailLine(index)}>
                    -
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Form.InputSelect
                  name={`_trx_details[${index}]._item_id`}
                  error={
                    currentFormState?.zodErrors?.[
                      `_trx_details.${index}._item_id`
                    ]
                  }>
                  <Form.Label>Item *</Form.Label>
                  <DropDown
                    entity="item"
                    name={`_trx_details[${index}]._item_id`}
                    required={true}
                  />
                </Form.InputSelect>

                <Form.InputSelect
                  name={`_trx_details[${index}]._from_bin_id`}
                  error={
                    currentFormState?.zodErrors?.[
                      `_trx_details.${index}._from_bin_id`
                    ]
                  }>
                  <Form.Label>From Bin</Form.Label>
                  <DropDown
                    entity="bin"
                    name={`_trx_details[${index}]._from_bin_id`}
                  />
                </Form.InputSelect>

                <Form.InputWithLabel
                  name={`_trx_details[${index}]._qty_in`}
                  type="number"
                  inputValue={
                    currentFormState.formData?._trx_details?.[index]?._qty_in
                  }
                  placeholder="Enter Qty in"
                  error={
                    currentFormState?.zodErrors?.[
                      `_trx_details.${index}._qty_in`
                    ]
                  }>
                  Quantity In
                </Form.InputWithLabel>

                <Form.InputSelect
                  name={`_trx_details[${index}]._to_bin_id`}
                  error={
                    currentFormState?.zodErrors?.[
                      `_trx_details.${index}._to_bin_id`
                    ]
                  }>
                  <Form.Label>To Bin</Form.Label>
                  <DropDown
                    entity="bin"
                    name={`_trx_details[${index}]._to_bin_id`}
                  />
                </Form.InputSelect>

                <Form.InputWithLabel
                  name={`_trx_details[${index}]._qty_out`}
                  type="number"
                  inputValue={
                    currentFormState.formData?._trx_details?.[index]?._qty_out
                  }
                  placeholder="Enter Qty out"
                  error={
                    currentFormState?.zodErrors?.[
                      `_trx_details.${index}._qty_out`
                    ]
                  }>
                  Quantity Out
                </Form.InputWithLabel>
              </div>

              <div className="mt-4">
                <Form.InputWithLabel
                  name={`_trx_details[${index}]._item_trx_desc`}
                  inputValue={
                    currentFormState.formData?._trx_details?.[index]
                      ?._item_trx_desc
                  }
                  placeholder="Enter item trx description"
                  error={
                    currentFormState?.zodErrors?.[
                      `_trx_details.${index}._item_trx_desc`
                    ]
                  }
                  required>
                  Item Transaction Description *
                </Form.InputWithLabel>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Form.Footer>
        <Button disabled={pending} variant="secondary" onClick={onCloseModal}>
          <span>Cancel</span>
        </Button>
        <Button disabled={pending} variant="primary" type="submit">
          {pending && <SpinnerMini />}
          <span>Create Transaction</span>
        </Button>
      </Form.Footer>
    </Form>
  );
}
