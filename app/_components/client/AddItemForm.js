"use client";

import Form from "@/app/_components/_ui/Form";
import { useActionState, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createItem } from "../../_lib/actions";
import { getClientValidationSchema } from "../../_lib/ZodSchemas";
import { useAppStore } from "../../_store/AppProvider";
import Button from "../_ui/Button";
import { ParentSelector } from "../_ui/client/ParentSelector";
import SpinnerMini from "../_ui/SpinnerMini";

/**
 * A form for adding a new item, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function AddItemForm({ onCloseModal }) {
  // const ORG_UUID = "ceba721b-b8dc-487d-a80c-15ae9d947084";
  // const USR_UUID = "2bfdec48-d917-41ee-99ff-123757d59df1";

  // 1- Get existing items from the store for validation
  const existingItems = useAppStore((state) => state.item || []);

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    createItem,
    initialState,
  );

  const [clientFormState, setClientFormState] = useState(initialState);

  const currentFormState = clientFormState?.message
    ? clientFormState
    : formState;

  useEffect(() => {
    if (formState?.success) {
      toast.success(`Item ${formState.formData?._item_name} has been created.`);
      setClientFormState(initialState); //reset client form state
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    // CLIENT VALIDATE FORM DATA
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    // console.log(data);

    // 2- get the validation schema with refreshed validation data

    const schema = getClientValidationSchema("item", existingItems, "create");

    // const itemSchemaWithValidation = schema.getClientValidationSchema(
    //   "item",
    //   existingItems,
    //   "create",
    // );

    // 3- perform combined validation
    const validationResults = schema.safeParse(data);

    // 4- if form data did not pass client validation
    if (!validationResults.success) {
      e.preventDefault();
      setClientFormState({
        success: false,
        formData: data,
        zodErrors: validationResults.error.flatten().fieldErrors,
        message: "Fix these errors to proceed.",
      });
    } else {
      // if passed client validation then reset form state
      setClientFormState(initialState);
    }
  }

  console.log(currentFormState);
  return (
    <Form action={formAction} onSubmit={handleSubmit}>
      <Form.ZodErrors
        error={formState?.["message"] || clientFormState?.message}
      />
      <Form.InputSelect name={"_item_class_id"}>
        <Form.Label>Select Item Class *</Form.Label>
        <ParentSelector
          parent="itemClass"
          _col_name="_item_class_id"
          label="item class"
          required={true}
        />
      </Form.InputSelect>
      <Form.InputWithLabel
        name={"_item_name"}
        inputValue={currentFormState.formData?._item_name}
        placeholder="Enter Item name"
        error={currentFormState?.zodErrors?._item_name}>
        Item Name *
      </Form.InputWithLabel>
      <Form.InputWithLabel
        name={"_item_desc"}
        inputValue={currentFormState.formData?._item_desc}
        placeholder="Enter Item description"
        error={currentFormState?.zodErrors?._item_desc}>
        Item Description *
      </Form.InputWithLabel>
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          <span> Cancel</span>
        </Button>
        <Button disabled={pending} type="secondary">
          {pending && <SpinnerMini />}
          <span> Add Item</span>
        </Button>
      </Form.Footer>
    </Form>
  );
}
