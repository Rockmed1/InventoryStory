"use client";

import Form from "@/app/_components/_ui/Form";
import { createMarketType } from "@/app/_lib/actions";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import Button from "../_ui/Button";
import SpinnerMini from "../_ui/SpinnerMini";

/**
 * A form for adding a new market type, designed to be used within a modal.
 * It handles form submission using a server action and displays success notifications.
 *
 * @param {Function} [onCloseModal] - An optional function to close the modal on successful submission.
 */
export default function AddMarketTypeForm({ onCloseModal }) {
    // const ORG_UUID = "ceba721b-b8dc-487d-a80c-15ae9d947084";
  // const USR_UUID = "2bfdec48-d917-41ee-99ff-123757d59df1";

  //const initialState = {
    // _org_uuid: ORG_UUID,
    // _usr_uuid: USR_UUID,
  //};
  const initialState = {};
  const [state, formAction, pending] = useActionState(
    createMarketType,
    initialState,
  );

  //? evalute if useCallback is a better option
  // const initialState = {
  //   parentId: null,
  // };

  // const createMarketTypesWrapper = useCallback(
  //   (prevState, formData) => {
  //     return createMarketTypes({
  //       _org_uuid: ORG_UUID,
  //       _usr_uuid: USR_UUID,
  //       ...prevState,
  //       formData,
  //     });
  //   },
  //   [ORG_UUID, USR_UUID],
  // );

  // const [state, formAction, pending] = useActionState(
  //   createMarketTypesWrapper,
  //   initialState,
  // );

  // console.log(state);

  useEffect(() => {
    if (state?.success === true) {
      toast.success("Market Type has been created.");
      onCloseModal?.();
    }
  }, [state, onCloseModal]);

  return (
    <Form action={formAction}>
      <Form.InputWithLabel name={"_market_type_name"} description="">
        Market Type
      </Form.InputWithLabel>
      <Form.InputWithLabel name={"_market_type_desc"} description="">
        Market Type Description
      </Form.InputWithLabel>
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          <span> Cancel</span>
        </Button>
        <Button disabled={pending} type="secondary">
          {pending && <SpinnerMini />}
          <span> Add Market Type</span>
        </Button>
      </Form.Footer>
    </Form>
  );
}
