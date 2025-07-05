"use client";

import Form from "@/app/_components/_ui/Form";
import { createTrxType } from "@/app/_lib/actions";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import Button from "../_ui/Button";
import SpinnerMini from "../_ui/SpinnerMini";
import { ParentSelector } from "../_ui/client/ParentSelector";

/**
 * A form for adding a new transaction type, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */
export default function AddTrxTypeForm({ onCloseModal }) {
    // const ORG_UUID = "ceba721b-b8dc-487d-a80c-15ae9d947084";
  // const USR_UUID = "2bfdec48-d917-41ee-99ff-123757d59df1";

  //const initialState = {
    // _org_uuid: ORG_UUID,
    // _usr_uuid: USR_UUID,
  //};
  const initialState = {};
  const [state, formAction, pending] = useActionState(
    createTrxType,
    initialState,
  );

  //? evalute if useCallback is a better option
  // const initialState = {
  //   parentId: null,
  // };

  // const createTrxTypesWrapper = useCallback(
  //   (prevState, formData) => {
  //     return createTrxTypes({
  //       _org_uuid: ORG_UUID,
  //       _usr_uuid: USR_UUID,
  //       ...prevState,
  //       formData,
  //     });
  //   },
  //   [ORG_UUID, USR_UUID],
  // );

  // const [state, formAction, pending] = useActionState(
  //   createTrxTypesWrapper,
  //   initialState,
  // );

  // console.log(state);

  useEffect(() => {
    if (state?.success === true) {
      toast.success("Transaction Type has been created.");
      onCloseModal?.();
    }
  }, [state, onCloseModal]);

  return (
    <Form action={formAction}>
      <Form.InputSelect name={"_trx_direction_id"}>
        <Form.Label>Select Transaction Direction *</Form.Label>
        <ParentSelector
          parent="trxDirections"
          _col_name="_trx_direction_id"
          label="transaction direction"
          required={true}
        />
      </Form.InputSelect>
      <Form.InputWithLabel name={"_trx_type_name"} description="">
        Trx Type
      </Form.InputWithLabel>
      <Form.InputWithLabel name={"_trx_type_desc"} description="">
        Trx Type Description
      </Form.InputWithLabel>
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          <span> Cancel</span>
        </Button>
        <Button disabled={pending} type="secondary">
          {pending && <SpinnerMini />}
          <span> Add Trx Type</span>
        </Button>
      </Form.Footer>
    </Form>
  );
}
