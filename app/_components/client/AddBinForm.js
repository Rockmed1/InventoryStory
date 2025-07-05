"use client";

import Form from "@/app/_components/_ui/Form";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { createBin } from "../../_lib/actions";
import Button from "../_ui/Button";
import { ParentSelector } from "../_ui/client/ParentSelector";
import SpinnerMini from "../_ui/SpinnerMini";

/**
 * A form for adding a new bin, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 * ParentSelector is required to link to the parent location
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */
export default function AddBinForm({ onCloseModal }) {
    // const ORG_UUID = "ceba721b-b8dc-487d-a80c-15ae9d947084";
  // const USR_UUID = "2bfdec48-d917-41ee-99ff-123757d59df1";

  //const initialState = {
    // _org_uuid: ORG_UUID,
    // _usr_uuid: USR_UUID,
  //};
  const initialState = {};
  const [state, formAction, pending] = useActionState(createBin, initialState);

  // console.log(state);

  useEffect(() => {
    if (state?.success === true) {
      toast.success("Bin has been created.");
      onCloseModal?.();
    }
  }, [state, onCloseModal]);

  return (
    <Form action={formAction}>
      <Form.InputSelect name={"_loc_id"}>
        <Form.Label>Select Location *</Form.Label>
        <ParentSelector
          parent="locations"
          _col_name="_loc_id"
          label="location"
          required={true}
        />
      </Form.InputSelect>
      <Form.InputWithLabel name={"_bin_name"} description="">
        Bin Name
      </Form.InputWithLabel>
      <Form.InputWithLabel name={"_bin_desc"} description="">
        Bin Description
      </Form.InputWithLabel>
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          <span> Cancel</span>
        </Button>
        <Button disabled={pending} type="secondary">
          {pending && <SpinnerMini />}
          <span> Add Bin</span>
        </Button>
      </Form.Footer>
    </Form>
  );
}
