"use client";

import Form from "@/app/_components/_ui/client/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createLocation } from "../../_lib/server/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import Button from "../_ui/server/Button";
import SpinnerMini from "../_ui/server/SpinnerMini";

/**
 * A form for adding a new location, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */
export default function AddLocationForm({ onCloseModal }) {
  const existingLocations = useAppStore((state) => state.location || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    createLocation,
    initialState,
  );
  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(
        `Location ${formState.formData?._loc_name} has been created.`,
      );
      setClientFormState(initialState); //clear any client errors
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const validationSchema = getClientValidationSchema(
      "location",
      existingLocations,
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
        name={"_loc_name"}
        inputValue={currentFormState.formData?._loc_name}
        placeholder="Enter Location name"
        error={currentFormState?.zodErrors?._loc_name}>
        Location Name *
      </Form.InputWithLabel>
      <Form.InputWithLabel
        name={"_loc_desc"}
        inputValue={currentFormState.formData?._loc_desc}
        placeholder="Enter Location description"
        error={currentFormState?.zodErrors?._loc_desc}>
        Location Description *
      </Form.InputWithLabel>
      <Form.Footer>
        <Button disabled={pending} variant="secondary" onClick={onCloseModal}>
          <span>Cancel</span>
        </Button>
        <Button disabled={pending} variant="secondary" type="submit">
          {pending && <SpinnerMini />}
          <span>Add Location</span>
        </Button>
      </Form.Footer>
    </Form>
  );
}
