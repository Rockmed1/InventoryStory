"use client";

import Form from "@/app/_components/_ui/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { updateItemClass } from "../../_lib/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import Button from "../_ui/Button";
import SpinnerMini from "../_ui/SpinnerMini";

/**
 * A form for editing an existing item class, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Object} itemClassToEdit - The item class object to edit
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function EditItemClassForm({ itemClassToEdit, onCloseModal }) {
  const existingItemClasses = useAppStore((state) => state.itemClass || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    updateItemClass,
    initialState,
  );
  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(`Item Class ${formState.formData?._item_class_name} has been updated.`);
      setClientFormState(initialState);
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const validationSchema = getClientValidationSchema(
      "itemClass",
      existingItemClasses,
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
      <input type="hidden" name="_item_class_id" value={itemClassToEdit.id} />
      
      <Form.InputWithLabel
        name={"_item_class_name"}
        inputValue={currentFormState.formData?._item_class_name || itemClassToEdit.name}
        placeholder="Enter Item Class name"
        error={currentFormState?.zodErrors?._item_class_name}>
        Item Class Name *
      </Form.InputWithLabel>
      
      <Form.InputWithLabel
        name={"_item_class_desc"}
        inputValue={currentFormState.formData?._item_class_desc || itemClassToEdit.description}
        placeholder="Enter Item Class description"
        error={currentFormState?.zodErrors?._item_class_desc}>
        Item Class Description *
      </Form.InputWithLabel>
      
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          Cancel
        </Button>
        <Button disabled={pending} type="primary">
          {pending && <SpinnerMini />}
          Update Item Class
        </Button>
      </Form.Footer>
    </Form>
  );
}