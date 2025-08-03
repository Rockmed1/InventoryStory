"use client";

import Button from "../server/Button";
import Modal from "./Modal";

export default function ButtonWithModal({
  opensWindowName,
  title,
  description,
  icon,
  lable,
  children,
}) {
  return (
    <div>
      <Modal>
        <Modal.Open opensWindowName={opensWindowName}>
          <Button variant="secondary">
            <div className="flex items-center justify-between gap-1">
              {icon}
              <span>{lable}</span>
            </div>
          </Button>
        </Modal.Open>
        <Modal.Window
          name={opensWindowName}
          title={title}
          description={description}
          isUseOutsideClick={true}>
          {children}
        </Modal.Window>
      </Modal>
    </div>
  );
}
