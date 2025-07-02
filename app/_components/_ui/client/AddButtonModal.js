"use client";

import { BoltIcon } from "@heroicons/react/24/outline";
import Button from "../Button";
import Modal from "./Modal";

export default function AddButtonModal({
  opensWindowName,
  buttonLabel,
  description,
  children,
}) {
  return (
    <div>
      <Modal>
        <Modal.Open opensWindowName={opensWindowName}>
          <Button type="secondary">
            <div className="flex items-center justify-between gap-1">
              {/* <PlusIcon className="size-4" /> */}
              {/* <span>{buttonLabel}</span> */}
              <BoltIcon className="size-4" />
              <span>New</span>
            </div>
          </Button>
        </Modal.Open>
        <Modal.Window
          name={opensWindowName}
          title={buttonLabel}
          description={description}
          isUseOutsideClick={false}>
          {children}
        </Modal.Window>
      </Modal>
    </div>
  );
}
