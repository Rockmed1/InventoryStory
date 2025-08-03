"use client";

import Form from "@/app/_components/_ui/client/Form";
import { getValidationSchema } from "@/app/_lib/getValidationSchema";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateTrxType } from "../../_lib/server/actions";
import { useAppStore } from "../../_store/AppProvider";
import { DropDown } from "../_ui/client/DropDown";
import Button from "../_ui/server/Button";
import SpinnerMini from "../_ui/server/SpinnerMini";

/**
 * A form for editing an existing transaction type, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {number} id - The transaction type ID to edit
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function EditTrxTypeForm({ id, onCloseModal }) {
  // Get existing transaction types from the store for validation
  const existingTrxTypes = useAppStore((state) => state.trxType || []);
  const [trxTypeToEdit] = existingTrxTypes.filter(
    (trxType) => trxType.id === id,
  );

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
      toast.success(
        `Transaction Type ${formState.formData?._trx_type_name} has been updated.`,
      );
      setClientFormState(initialState);
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function isChanged(trxTypeToEdit, data) {
    const { name, description, trx_direction_id } = trxTypeToEdit;
    const { _trx_type_name, _trx_type_desc, _trx_direction_id } = data;

    // console.log("Name changed:", name.toString() !== _trx_type_name.toString());
    // console.log("Description changed:", description.toString() !== _trx_type_desc.toString());
    // console.log("Transaction Direction changed:", trx_direction_id.toString() !== _trx_direction_id.toString());

    if (
      name.toString() !== _trx_type_name.toString() ||
      description.toString() !== _trx_type_desc.toString() ||
      trx_direction_id.toString() !== _trx_direction_id.toString()
    ) {
      return true;
    } else {
      return false;
    }
  }

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    // Don't do anything if no change
    if (!isChanged(trxTypeToEdit, data)) {
      e.preventDefault();
      return;
    }

    // CLIENT VALIDATE FORM DATA for UPDATE operation
    const validationSchema = getValidationSchema(
      "trxType",
      existingTrxTypes,
      "update",
      data._trx_type_id,
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
    }
    // If pass validation
    else {
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
        <DropDown
          parent="trxDirections"
          name="_trx_direction_id"
          label="transaction direction"
          required={true}
          defaultValue={trxTypeToEdit.trx_direction_id}
        />
      </Form.InputSelect>

      <Form.InputWithLabel
        name={"_trx_type_name"}
        inputValue={
          currentFormState.formData?._trx_type_name || trxTypeToEdit.name
        }
        placeholder="Enter Transaction Type name"
        error={currentFormState?.zodErrors?._trx_type_name}>
        Transaction Type Name *
      </Form.InputWithLabel>

      <Form.InputWithLabel
        name={"_trx_type_desc"}
        inputValue={
          currentFormState.formData?._trx_type_desc || trxTypeToEdit.description
        }
        placeholder="Enter Transaction Type description"
        error={currentFormState?.zodErrors?._trx_type_desc}>
        Transaction Type Description *
      </Form.InputWithLabel>

      <Form.Footer>
        <Button disabled={pending} variant="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Button disabled={pending} variant="primary">
          {pending && <SpinnerMini />}
          Update Transaction Type
        </Button>
      </Form.Footer>
    </Form>
  );
}
