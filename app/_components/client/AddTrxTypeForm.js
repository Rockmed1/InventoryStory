"use client";

import Form from "@/app/_components/_ui/Form";
import { createTrxType } from "@/app/_lib/actions";
import { schema } from "@/app/_lib/ZodSchemas";
import { useAppStore } from "@/app/_store/AppProvider";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../_ui/Button";
import { ParentSelector } from "../_ui/client/ParentSelector";
import SpinnerMini from "../_ui/SpinnerMini";

/**
 * A form for adding a new transaction type, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */
export default function AddTrxTypeForm({ onCloseModal }) {
  const existingTrxTypes = useAppStore((state) => state.trxTypes || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    createTrxType,
    initialState,
  );
  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(
        `Transaction Type ${formState.formData?._trx_type_name} has been created.`,
      );
      setClientFormState(initialState); //clear any client errors
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const trxTypeSchemaWithValidation = schema.createClientSchemaValidation(
      "trxTypes",
      existingTrxTypes,
    );
    const validationResults = trxTypeSchemaWithValidation.safeParse(data);

    if (!validationResults.success) {
      e.preventDefault();
      setClientFormState({
        success: false,
        formData: data,
        zodErrors: validationResults.error.flatten().fieldErrors,
        message: "Fix these errors to proceed.",
      });
    } else {
      setClientFormState(initialState);
    }
  }

  return (
    <Form action={formAction} onSubmit={handleSubmit}>
      <Form.ZodErrors
        error={formState?.["message"] || clientFormState?.message}
      />
      <Form.InputSelect name={"_trx_direction_id"}>
        <Form.Label>Select Transaction Direction *</Form.Label>
        <ParentSelector
          parent="trxDirections"
          _col_name="_trx_direction_id"
          label="transaction direction"
          required={true}
        />
      </Form.InputSelect>
      <Form.InputWithLabel
        name={"_trx_type_name"}
        inputValue={currentFormState.formData?._trx_type_name}
        placeholder="Enter Trx Type name"
        error={currentFormState?.zodErrors?._trx_type_name}>
        Trx Type
      </Form.InputWithLabel>
      <Form.InputWithLabel
        name={"_trx_type_desc"}
        inputValue={currentFormState.formData?._trx_type_desc}
        placeholder="Enter Trx Type description"
        error={currentFormState?.zodErrors?._trx_type_desc}>
        Trx Type Description
      </Form.InputWithLabel>
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          <span>Cancel</span>
        </Button>
        <Button disabled={pending} type="secondary">
          {pending && <SpinnerMini />}
          <span>Add Trx Type</span>
        </Button>
      </Form.Footer>
    </Form>
  );
}
