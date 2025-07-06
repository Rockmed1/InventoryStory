"use client";

import Form from "@/app/_components/_ui/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateItem } from "../../_lib/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import Button from "../_ui/Button";
import { ParentSelector } from "../_ui/client/ParentSelector";
import SpinnerMini from "../_ui/SpinnerMini";

/**
 * A form for editing an existing item, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Object} itemToEdit - The item object to edit
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function EditItemForm({ itemToEdit, onCloseModal }) {
  // Get existing items from the store for validation
  const existingItems = useAppStore((state) => state.item || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    updateItem,
    initialState,
  );
  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(`Item ${formState.formData?._item_name} has been updated.`);
      setClientFormState(initialState);
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    // CLIENT VALIDATE FORM DATA for UPDATE operation
    const validationSchema = getClientValidationSchema(
      "item",
      existingItems,
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
      <input type="hidden" name="_item_id" value={itemToEdit.id} />
      
      <Form.InputSelect name={"_item_class_id"}>
        <Form.Label>Select Item Class *</Form.Label>
        <ParentSelector
          parent="itemClass"
          _col_name="_item_class_id"
          label="item class"
          required={true}
          defaultValue={itemToEdit.item_class_id}
        />
      </Form.InputSelect>
      
      <Form.InputWithLabel
        name={"_item_name"}
        inputValue={currentFormState.formData?._item_name || itemToEdit.name}
        placeholder="Enter Item name"
        error={currentFormState?.zodErrors?._item_name}>
        Item Name *
      </Form.InputWithLabel>
      
      <Form.InputWithLabel
        name={"_item_desc"}
        inputValue={currentFormState.formData?._item_desc || itemToEdit.description}
        placeholder="Enter Item description"
        error={currentFormState?.zodErrors?._item_desc}>
        Item Description *
      </Form.InputWithLabel>
      
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Button disabled={pending} type="primary">
          {pending && <SpinnerMini />}
          Update Item
        </Button>
      </Form.Footer>
    </Form>
  );
}