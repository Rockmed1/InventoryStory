"use client";

import Form from "@/app/_components/_ui/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateMarketType } from "../../_lib/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import Button from "../_ui/Button";
import SpinnerMini from "../_ui/SpinnerMini";

/**
 * A form for editing an existing market type, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Object} marketTypeToEdit - The market type object to edit
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function EditMarketTypeForm({ marketTypeToEdit, onCloseModal }) {
  const existingMarketTypes = useAppStore((state) => state.marketType || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    updateMarketType,
    initialState,
  );
  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(`Market Type ${formState.formData?._market_type_name} has been updated.`);
      setClientFormState(initialState);
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const validationSchema = getClientValidationSchema(
      "marketType",
      existingMarketTypes,
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
      <input type="hidden" name="_market_type_id" value={marketTypeToEdit.id} />
      
      <Form.InputWithLabel
        name={"_market_type_name"}
        inputValue={currentFormState.formData?._market_type_name || marketTypeToEdit.name}
        placeholder="Enter Market Type name"
        error={currentFormState?.zodErrors?._market_type_name}>
        Market Type Name *
      </Form.InputWithLabel>
      
      <Form.InputWithLabel
        name={"_market_type_desc"}
        inputValue={currentFormState.formData?._market_type_desc || marketTypeToEdit.description}
        placeholder="Enter Market Type description"
        error={currentFormState?.zodErrors?._market_type_desc}>
        Market Type Description *
      </Form.InputWithLabel>
      
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Button disabled={pending} type="primary">
          {pending && <SpinnerMini />}
          Update Market Type
        </Button>
      </Form.Footer>
    </Form>
  );
}