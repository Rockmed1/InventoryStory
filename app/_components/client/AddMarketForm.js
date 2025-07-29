"use client";

import Form from "@/app/_components/_ui/client/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createMarket } from "../../_lib/server/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import { DropDown } from "../_ui/client/DropDown";
import Button from "../_ui/server/Button";
import SpinnerMini from "../_ui/server/SpinnerMini";

/**
 * A form for adding a new market, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */
export default function AddMarketForm({ onCloseModal }) {
  const existingMarkets = useAppStore((state) => state.market || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    createMarket,
    initialState,
  );
  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(
        `Market ${formState.formData?._market_name} has been created.`,
      );
      setClientFormState(initialState); //clear any client errors
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const validationSchema = getClientValidationSchema(
      "market",
      existingMarkets,
      "create",
    );
    const validationResults = validationSchema.safeParse(data);

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
      <Form.InputSelect name={"_market_type_id"}>
        <Form.Label>Select Market Type *</Form.Label>
        <DropDown
          parent="marketType"
          name="_market_type_id"
          label="market type"
          required={true}
        />
      </Form.InputSelect>
      <Form.InputWithLabel
        name={"_market_name"}
        inputValue={currentFormState.formData?._market_name}
        placeholder="Enter Market name"
        error={currentFormState?.zodErrors?._market_name}>
        Market Name *
      </Form.InputWithLabel>
      <Form.InputWithLabel
        name={"_market_desc"}
        inputValue={currentFormState.formData?._market_desc}
        placeholder="Enter Market description"
        error={currentFormState?.zodErrors?._market_desc}>
        Market Description *
      </Form.InputWithLabel>
      <Form.InputWithLabel
        name={"_market_url"}
        inputValue={currentFormState.formData?._market_url}
        placeholder="Enter Market URL"
        error={currentFormState?.zodErrors?._market_url}>
        Market URL *
      </Form.InputWithLabel>
      <Form.Footer>
        <Button disabled={pending} variant="secondary" onClick={onCloseModal}>
          <span>Cancel</span>
        </Button>
        <Button disabled={pending} variant="secondary" type="submit">
          {pending && <SpinnerMini />}
          <span>Add Market</span>
        </Button>
      </Form.Footer>
    </Form>
  );
}
