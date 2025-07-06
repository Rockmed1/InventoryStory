"use client";

import Form from "@/app/_components/_ui/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateTrxType } from "../../_lib/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import Button from "../_ui/Button";
import { ParentSelector } from "../_ui/client/ParentSelector";
import SpinnerMini from "../_ui/SpinnerMini";

/**
 * A form for editing an existing transaction type, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Object} trxTypeToEdit - The transaction type object to edit
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function EditTrxTypeForm({ trxTypeToEdit, onCloseModal }) {
  const existingTrxTypes = useAppStore((state) => state.trxType || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    updateTrxType,
    initialState,
  );
  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(`Transaction Type ${formState.formData?._trx_type_name} has been updated.`);
      setClientFormState(initialState);
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const validationSchema = getClientValidationSchema(
      "trxType",
      existingTrxTypes,
      "update"
    );
    const validationResults = validationSchema.safeParse(data);

    if (!validationResults.success) {
      e.preventDefault();
      setClientFormState({
        success: false,
        formData: data,
        zodErrors: validationResults.error.flatten().fieldErrors,
        message: "Please fix the errors below.",
      });
    } else {
      setClientFormState(initialState);
    }
  }

  return (
    <Form action={formAction} onSubmit={handleSubmit}>
      <Form.ZodErrors error={currentFormState?.message} />
      
      {/* Hidden ID field */}
      <input type="hidden" name="_trx_type_id" value={trxTypeToEdit.id} />
      
      <Form.InputSelect name={"_trx_direction_id"}>
        <Form.Label>Select Transaction Direction *</Form.Label>
        <ParentSelector
          parent="trxDirections"
          _col_name="_trx_direction_id"
          label="transaction direction"
          required={true}
          defaultValue={trxTypeToEdit.trx_direction_id}
        />
      </Form.InputSelect>
      
      <Form.InputWithLabel
        name={"_trx_type_name"}
        inputValue={currentFormState.formData?._trx_type_name || trxTypeToEdit.name}
        placeholder="Enter Transaction Type name"
        error={currentFormState?.zodErrors?._trx_type_name}>
        Transaction Type Name *
      </Form.InputWithLabel>
      
      <Form.InputWithLabel
        name={"_trx_type_desc"}
        inputValue={currentFormState.formData?._trx_type_desc || trxTypeToEdit.description}
        placeholder="Enter Transaction Type description"
        error={currentFormState?.zodErrors?._trx_type_desc}>
        Transaction Type Description *
      </Form.InputWithLabel>
      
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Button disabled={pending} type="primary">
          {pending && <SpinnerMini />}
          Update Transaction Type
        </Button>
      </Form.Footer>
    </Form>
  );
}