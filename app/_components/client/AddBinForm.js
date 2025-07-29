"use client";

import Form from "@/app/_components/_ui/client/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createBin } from "../../_lib/server/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import { DropDown } from "../_ui/client/DropDown";
import Button from "../_ui/server/Button";
import SpinnerMini from "../_ui/server/SpinnerMini";

/**
 * A form for adding a new bin, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */
export default function AddBinForm({ onCloseModal }) {
  const existingBins = useAppStore((state) => state.bin || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    createBin,
    initialState,
  );
  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(`Bin ${formState.formData?._bin_name} has been created.`);
      setClientFormState(initialState); //clear any client errors
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const validationSchema = getClientValidationSchema(
      "bin",
      existingBins,
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
      <Form.InputSelect name={"_loc_id"}>
        <Form.Label>Select Location *</Form.Label>
        <DropDown
          parent="location"
          name="_loc_id"
          label="location"
          required={true}
        />
      </Form.InputSelect>
      <Form.InputWithLabel
        name={"_bin_name"}
        inputValue={currentFormState.formData?._bin_name}
        placeholder="Enter Bin name"
        error={currentFormState?.zodErrors?._bin_name}>
        Bin Name *
      </Form.InputWithLabel>
      <Form.InputWithLabel
        name={"_bin_desc"}
        inputValue={currentFormState.formData?._bin_desc}
        placeholder="Enter Bin description"
        error={currentFormState?.zodErrors?._bin_desc}>
        Bin Description *
      </Form.InputWithLabel>
      <Form.Footer>
        <Button disabled={pending} variant="secondary" onClick={onCloseModal}>
          <span>Cancel</span>
        </Button>
        <Button disabled={pending} variant="secondary" type="submit">
          {pending && <SpinnerMini />}
          <span>Add Bin</span>
        </Button>
      </Form.Footer>
    </Form>
  );
}
