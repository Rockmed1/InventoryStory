"use client";

import Form from "@/app/_components/_ui/client/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateMarket } from "../../_lib/server/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import { DropDown } from "../_ui/client/DropDown";
import Button from "../_ui/server/Button";
import SpinnerMini from "../_ui/server/SpinnerMini";

/**
 * A form for editing an existing market, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {number} id - The market ID to edit
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function EditMarketForm({ id, onCloseModal }) {
  // Get existing markets from the store for validation
  const existingMarkets = useAppStore((state) => state.market || []);
  const [marketToEdit] = existingMarkets.filter((market) => market.id === id);

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
      toast.success(
        `Market ${formState.formData?._market_name} has been updated.`,
      );
      setClientFormState(initialState);
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function isChanged(marketToEdit, data) {
    const { name, description, url, market_type_id } = marketToEdit;
    const { _market_name, _market_desc, _market_url, _market_type_id } = data;

    // console.log("Name changed:", name.toString() !== _market_name.toString());
    // console.log("Description changed:", description.toString() !== _market_desc.toString());
    // console.log("URL changed:", url.toString() !== _market_url.toString());
    // console.log("Market Type changed:", market_type_id.toString() !== _market_type_id.toString());

    if (
      name.toString() !== _market_name.toString() ||
      description.toString() !== _market_desc.toString() ||
      url.toString() !== _market_url.toString() ||
      market_type_id.toString() !== _market_type_id.toString()
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
    if (!isChanged(marketToEdit, data)) {
      e.preventDefault();
      return;
    }

    // CLIENT VALIDATE FORM DATA for UPDATE operation
    const validationSchema = getClientValidationSchema(
      "market",
      existingMarkets,
      "update",
      data._market_id,
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
      <input type="hidden" name="_market_id" value={marketToEdit.id} />

      <Form.InputSelect name={"_market_type_id"}>
        <Form.Label>Select Market Type *</Form.Label>
        <DropDown
          parent="marketType"
          name="_market_type_id"
          label="market type"
          required={true}
          defaultValue={marketToEdit.market_type_id}
        />
      </Form.InputSelect>

      <Form.InputWithLabel
        name={"_market_name"}
        inputValue={
          currentFormState.formData?._market_name || marketToEdit.name
        }
        placeholder="Enter Market name"
        error={currentFormState?.zodErrors?._market_name}>
        Market Name *
      </Form.InputWithLabel>

      <Form.InputWithLabel
        name={"_market_desc"}
        inputValue={
          currentFormState.formData?._market_desc || marketToEdit.description
        }
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
        <Button disabled={pending} variant="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Button disabled={pending} variant="primary">
          {pending && <SpinnerMini />}
          Update Market
        </Button>
      </Form.Footer>
    </Form>
  );
}
