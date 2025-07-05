"use client";

import Form from "@/app/_components/_ui/Form";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { createItem } from "../../_lib/actions";
import Button from "../_ui/Button";
import { ParentSelector } from "../_ui/client/ParentSelector";
import SpinnerMini from "../_ui/SpinnerMini";
import { ZodErrors } from "../_ui/ZodError";

/**
 * A form for adding a new item, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */

export default function AddItemForm({ onCloseModal }) {
  // const ORG_UUID = "ceba721b-b8dc-487d-a80c-15ae9d947084";
  // const USR_UUID = "2bfdec48-d917-41ee-99ff-123757d59df1";

  //const initialState = {
  // _org_uuid: ORG_UUID,
  // _usr_uuid: USR_UUID,
  //};

  const initialState = {
    success: null,
    zodErrors: null,
    message: null,
  };

  const [formState, formAction, pending] = useActionState(
    createItem,
    initialState,
  );

  console.log(formState);

  useEffect(() => {
    if (formState?.success) {
      toast.success(`Item ${formState.formData?._item_name} has been created.`);
      onCloseModal?.();
    }
  }, [formState, onCloseModal]);

  function handleSubmit(e) {
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    const validationResults = itemFormSchema.safeParse(data);

    if (!validationResults.success) {
      e.preventDefault();
      return {
        formState: {
          success: false,
          formData: destructuredFormData,
          zodErrors: validationResults.error.flatten().fieldErrors,
          message: "Fix these errors to proceed.",
        },
      };
    }
  }

  return (
    <Form action={formAction} onSubmit={handleSubmit}>
      <Form.ZodErrors error={formState?.["message"]} />
      <Form.InputSelect name={"_item_class_id"}>
        <Form.Label>Select Item Class *</Form.Label>
        <ParentSelector
          parent="itemClasses"
          _col_name="_item_class_id"
          label="item class"
          required={true}
        />
      </Form.InputSelect>
      <Form.InputWithLabel
        name={"_item_name"}
        inputValue={formState.formData?._item_name}
        description={<ZodErrors error={formState?.zodErrors?._item_name} />}>
        Item Name
      </Form.InputWithLabel>
      <Form.InputWithLabel
        name={"_item_desc"}
        inputValue={formState.formData?._item_desc}
        description={<ZodErrors error={formState?.zodErrors?._item_desc} />}>
        Item Description
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
