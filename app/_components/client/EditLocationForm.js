"use client";

import Form from "@/app/_components/_ui/client/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateLocation } from "../../_lib/server/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import Button from "../_ui/server/Button";
import SpinnerMini from "../_ui/server/SpinnerMini";

/**
 * A form for editing an existing location, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {number} id - The location ID to edit
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function EditLocationForm({ id, onCloseModal }) {
  // Get existing locations from the store for validation
  const existingLocations = useAppStore((state) => state.location || []);
  const [locationToEdit] = existingLocations.filter(
    (location) => location.id === id,
  );

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
      toast.success(
        `Location ${formState.formData?._loc_name} has been updated.`,
      );
      setClientFormState(initialState);
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function isChanged(locationToEdit, data) {
    const { name, description } = locationToEdit;
    const { _loc_name, _loc_desc } = data;

    // console.log("Name changed:", name.toString() !== _loc_name.toString());
    // console.log("Description changed:", description.toString() !== _loc_desc.toString());

    if (
      name.toString() !== _loc_name.toString() ||
      description.toString() !== _loc_desc.toString()
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
    if (!isChanged(locationToEdit, data)) {
      e.preventDefault();
      return;
    }

    // CLIENT VALIDATE FORM DATA for UPDATE operation
    const validationSchema = getClientValidationSchema(
      "location",
      existingLocations,
      "update",
      data._loc_id,
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
        inputValue={
          currentFormState.formData?._loc_desc || locationToEdit.description
        }
        placeholder="Enter Location description"
        error={currentFormState?.zodErrors?._loc_desc}>
        Location Description *
      </Form.InputWithLabel>

      <Form.Footer>
        <Button disabled={pending} variant="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Button disabled={pending} variant="primary">
          {pending && <SpinnerMini />}
          Update Location
        </Button>
      </Form.Footer>
    </Form>
  );
}
