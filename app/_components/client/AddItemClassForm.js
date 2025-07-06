"use client";

import Form from "@/app/_components/_ui/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createItemClass } from "../../_lib/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import Button from "../_ui/Button";
import SpinnerMini from "../_ui/SpinnerMini";

/**
 * A form for adding a new item class, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */
export default function AddItemClassForm({ onCloseModal }) {
  const existingItemClasses = useAppStore((state) => state.itemClass || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    createItemClass,
    initialState,
  );
  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(
        `Item Class ${formState.formData?._item_class_name} has been created.`,
      );
      setClientFormState(initialState); //clear any client errors
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    const validationSchema = getClientValidationSchema(
      "itemClass",
      existingItemClasses,
      "create"
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
        name={"_item_class_name"}
        inputValue={currentFormState.formData?._item_class_name}
        placeholder="Enter Item Class name"
        error={currentFormState?.zodErrors?._item_class_name}>
        Item Class Name *
      </Form.InputWithLabel>
      <Form.InputWithLabel
        name={"_item_class_desc"}
        inputValue={currentFormState.formData?._item_class_desc}
        placeholder="Enter Item Class description"
        error={currentFormState?.zodErrors?._item_class_desc}>
        Item Class Description *
      </Form.InputWithLabel>
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          <span>Cancel</span>
        </Button>
        <Button disabled={pending} type="secondary">
          {pending && <SpinnerMini />}
          <span>Add Item Class</span>
        </Button>
      </Form.Footer>
    </Form>
  );
}
