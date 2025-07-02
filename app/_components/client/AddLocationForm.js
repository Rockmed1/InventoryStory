"use client";

import Form from "@/app/_components/_ui/Form";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { createLocation } from "../../_lib/actions";
import Button from "../_ui/Button";
import SpinnerMini from "../_ui/SpinnerMini";

export default function AddLocationForm({ onCloseModal }) {
  // const ORG_UUID = "ceba721b-b8dc-487d-a80c-15ae9d947084";
  // const USR_UUID = "2bfdec48-d917-41ee-99ff-123757d59df1";

  const initialState = {
    // _org_uuid: ORG_UUID,
    // _usr_uuid: USR_UUID,
  };

  const [state, formAction, pending] = useActionState(
    createLocation,
    initialState,
  );

  //? evalute if useCallback is a better option
  // const initialState = {
  //   parentId: null,
  // };

  // const createLocationWrapper = useCallback(
  //   (prevState, formData) => {
  //     return createLocation({
  //       _org_uuid: ORG_UUID,
  //       _usr_uuid: USR_UUID,
  //       ...prevState,
  //       formData,
  //     });
  //   },
  //   [ORG_UUID, USR_UUID],
  // );

  // const [state, formAction, pending] = useActionState(
  //   createLocationWrapper,
  //   initialState,
  // );

  // console.log(state);

  useEffect(() => {
    if (state?.success === true) {
      console.log("Location has been created. closing Modal");
      toast.success("Location has been created.");
      onCloseModal?.();
    }
  }, [state, onCloseModal]);

  return (
    <Form action={formAction}>
      <Form.InputWithLabel name={"_loc_name"} description="">
        Location Name
      </Form.InputWithLabel>
      <Form.InputWithLabel name={"_loc_desc"} description="">
        Location Description
      </Form.InputWithLabel>
      <Form.Footer>
        <Button disabled={pending} type="secondary" onClick={onCloseModal}>
          <span> Cancel</span>
        </Button>
        <Button disabled={pending} type="secondary">
          {pending && <SpinnerMini />}
          <span> Add Location</span>
        </Button>
      </Form.Footer>
    </Form>
  );
}
