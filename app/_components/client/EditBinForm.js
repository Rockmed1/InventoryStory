"use client";

import Form from "@/app/_components/_ui/client/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateBin } from "../../_lib/server/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import { DropDown } from "../_ui/client/DropDown";
import Button from "../_ui/server/Button";
import SpinnerMini from "../_ui/server/SpinnerMini";

/**
 * A form for editing an existing bin, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {number} id - The bin ID to edit
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function EditBinForm({ id, onCloseModal }) {
  const existingBins = useAppStore((state) => state.bin || []);
  const [binToEdit] = existingBins.filter((bin) => bin.id === id);

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

  function isChanged(binToEdit, data) {
    const { name, description, loc_id } = binToEdit;
    const { _bin_name, _bin_desc, _loc_id } = data;

    // console.log("Name changed:", name.toString() !== _bin_name.toString());
    // console.log("Description changed:", description.toString() !== _bin_desc.toString());
    // console.log("Location changed:", loc_id.toString() !== _loc_id.toString());

    if (
      name.toString() !== _bin_name.toString() ||
      description.toString() !== _bin_desc.toString() ||
      loc_id.toString() !== _loc_id.toString()
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
    if (!isChanged(binToEdit, data)) {
      e.preventDefault();
      return;
    }

    // CLIENT VALIDATE FORM DATA for UPDATE operation
    const validationSchema = getClientValidationSchema(
      "bin",
      existingBins,
      "update",
      data._bin_id,
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
      <input type="hidden" name="_bin_id" value={binToEdit.id} />

      <Form.InputSelect name={"_loc_id"}>
        <Form.Label>Select Location *</Form.Label>
        <DropDown
          parent="location"
          name="_loc_id"
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
        inputValue={
          currentFormState.formData?._bin_desc || binToEdit.description
        }
        placeholder="Enter Bin description"
        error={currentFormState?.zodErrors?._bin_desc}>
        Bin Description *
      </Form.InputWithLabel>

      <Form.Footer>
        <Button disabled={pending} variant="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Button disabled={pending} variant="primary">
          {pending && <SpinnerMini />}
          Update Bin
        </Button>
      </Form.Footer>
    </Form>
  );
}
