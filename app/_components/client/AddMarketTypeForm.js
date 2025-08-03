"use client";

import Form from "@/app/_components/_ui/client/Form";
import { getValidationSchema } from "@/app/_lib/getValidationSchema";
import { createMarketType } from "@/app/_lib/server/actions";
import { useAppStore } from "@/app/_store/AppProvider";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "../_ui/server/Button";
import SpinnerMini from "../_ui/server/SpinnerMini";

/**
 * A form for adding a new market type, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */
export default function AddMarketTypeForm({ onCloseModal }) {
  const existingMarketTypes = useAppStore((state) => state.marketType || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    createMarketType,
    initialState,
  );
  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(
        `Market Type ${formState.formData?._market_type_name} has been created.`,
      );
      setClientFormState(initialState); //clear any client errors
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const validationSchema = getValidationSchema(
      "marketType",
      existingMarketTypes,
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
      <Form.InputWithLabel
        name={"_market_type_name"}
        inputValue={currentFormState.formData?._market_type_name}
        placeholder="Enter Market Type name"
        error={currentFormState?.zodErrors?._market_type_name}>
        Market Type Name *
      </Form.InputWithLabel>
      <Form.InputWithLabel
        name={"_market_type_desc"}
        inputValue={currentFormState.formData?._market_type_desc}
        placeholder="Enter Market Type description"
        error={currentFormState?.zodErrors?._market_type_desc}>
        Market Type Description *
      </Form.InputWithLabel>
      <Form.Footer>
        <Button disabled={pending} variant="secondary" onClick={onCloseModal}>
          <span>Cancel</span>
        </Button>
        <Button disabled={pending} variant="secondary" type="submit">
          {pending && <SpinnerMini />}
          <span>Add Market Type</span>
        </Button>
      </Form.Footer>
    </Form>
  );
}
