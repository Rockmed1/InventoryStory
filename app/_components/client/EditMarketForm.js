"use client";

import Form from "@/app/_components/_ui/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateMarket } from "../../_lib/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import Button from "../_ui/Button";
import { ParentSelector } from "../_ui/client/ParentSelector";
import SpinnerMini from "../_ui/SpinnerMini";

/**
 * A form for editing an existing market, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Object} marketToEdit - The market object to edit
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function EditMarketForm({ marketToEdit, onCloseModal }) {
  const existingMarkets = useAppStore((state) => state.market || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    updateMarket,
    initialState,
  );
  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(`Market ${formState.formData?._market_name} has been updated.`);
      setClientFormState(initialState);
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const validationSchema = getClientValidationSchema(
      "market",
      existingMarkets,
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
      <input type="hidden" name="_market_id" value={marketToEdit.id} />
      
      <Form.InputSelect name={"_market_type_id"}>
        <Form.Label>Select Market Type *</Form.Label>
        <ParentSelector
          parent="marketType"
          _col_name="_market_type_id"
          label="market type"
          required={true}
          defaultValue={marketToEdit.market_type_id}
        />
      </Form.InputSelect>
      
      <Form.InputWithLabel
        name={"_market_name"}
        inputValue={currentFormState.formData?._market_name || marketToEdit.name}
        placeholder="Enter Market name"
        error={currentFormState?.zodErrors?._market_name}>
        Market Name *
      </Form.InputWithLabel>
      
      <Form.InputWithLabel
        name={"_market_desc"}
        inputValue={currentFormState.formData?._market_desc || marketToEdit.description}
        placeholder="Enter Market description"
        error={currentFormState?.zodErrors?._market_desc}>
        Market Description *
      </Form.InputWithLabel>
      
      <Form.InputWithLabel
        name={"_market_url"}
        inputValue={currentFormState.formData?._market_url || marketToEdit.url}
        placeholder="Enter Market URL"
        error={currentFormState?.zodErrors?._market_url}>
        Market URL *
      </Form.InputWithLabel>
      
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Button disabled={pending} type="primary">
          {pending && <SpinnerMini />}
          Update Market
        </Button>
      </Form.Footer>
    </Form>
  );
}