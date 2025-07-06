"use client";

import Form from "@/app/_components/_ui/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateBin } from "../../_lib/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import Button from "../_ui/Button";
import { ParentSelector } from "../_ui/client/ParentSelector";
import SpinnerMini from "../_ui/SpinnerMini";

/**
 * A form for editing an existing bin, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Object} binToEdit - The bin object to edit
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function EditBinForm({ binToEdit, onCloseModal }) {
  const existingBins = useAppStore((state) => state.bin || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    updateBin,
    initialState,
  );
  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(`Bin ${formState.formData?._bin_name} has been updated.`);
      setClientFormState(initialState);
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const validationSchema = getClientValidationSchema(
      "bin",
      existingBins,
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
      <input type="hidden" name="_bin_id" value={binToEdit.id} />
      
      <Form.InputSelect name={"_loc_id"}>
        <Form.Label>Select Location *</Form.Label>
        <ParentSelector
          parent="location"
          _col_name="_loc_id"
          label="location"
          required={true}
          defaultValue={binToEdit.loc_id}
        />
      </Form.InputSelect>
      
      <Form.InputWithLabel
        name={"_bin_name"}
        inputValue={currentFormState.formData?._bin_name || binToEdit.name}
        placeholder="Enter Bin name"
        error={currentFormState?.zodErrors?._bin_name}>
        Bin Name *
      </Form.InputWithLabel>
      
      <Form.InputWithLabel
        name={"_bin_desc"}
        inputValue={currentFormState.formData?._bin_desc || binToEdit.description}
        placeholder="Enter Bin description"
        error={currentFormState?.zodErrors?._bin_desc}>
        Bin Description *
      </Form.InputWithLabel>
      
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Button disabled={pending} type="primary">
          {pending && <SpinnerMini />}
          Update Bin
        </Button>
      </Form.Footer>
    </Form>
  );
}