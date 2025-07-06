"use client";

import Form from "@/app/_components/_ui/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateLocation } from "../../_lib/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import Button from "../_ui/Button";
import SpinnerMini from "../_ui/SpinnerMini";

/**
 * A form for editing an existing location, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Object} locationToEdit - The location object to edit
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function EditLocationForm({ locationToEdit, onCloseModal }) {
  // Get existing locations from the store for validation
  const existingLocations = useAppStore((state) => state.location || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    updateLocation,
    initialState,
  );
  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(`Location ${formState.formData?._loc_name} has been updated.`);
      setClientFormState(initialState);
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    // CLIENT VALIDATE FORM DATA for UPDATE operation
    const validationSchema = getClientValidationSchema(
      "location",
      existingLocations,
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
      <input type="hidden" name="_loc_id" value={locationToEdit.id} />
      
      <Form.InputWithLabel
        name={"_loc_name"}
        inputValue={currentFormState.formData?._loc_name || locationToEdit.name}
        placeholder="Enter Location name"
        error={currentFormState?.zodErrors?._loc_name}>
        Location Name *
      </Form.InputWithLabel>
      
      <Form.InputWithLabel
        name={"_loc_desc"}
        inputValue={currentFormState.formData?._loc_desc || locationToEdit.description}
        placeholder="Enter Location description"
        error={currentFormState?.zodErrors?._loc_desc}>
        Location Description *
      </Form.InputWithLabel>
      
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Button disabled={pending} type="primary">
          {pending && <SpinnerMini />}
          Update Location
        </Button>
      </Form.Footer>
    </Form>
  );
}