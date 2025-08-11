"use client";

import React, { useState } from "react";
import Menus from "./Menus";
import Modal from "./Modal";

export default function MenuWithModal({ rowData, rowActions }) {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <Modal>
      <Menus.Menu>
        <Menus.MenuToggle id={rowData.idField} />
        <Menus.MenuList id={rowData.idField}>
          {rowActions.map((rowAction) => (
            <Modal.Open
              key={`${rowAction.windowName}-${rowData.idField}`}
              opensWindowName={`${rowAction.windowName}-${rowData.idField}`}>
              <Menus.MenuButton onClick={() => setActiveModal(rowAction)}>
                <div className="flex items-center justify-between gap-3">
                  {rowAction.icon}
                  <span>{rowAction.buttonLabel}</span>
                </div>
              </Menus.MenuButton>
            </Modal.Open>
          ))}
        </Menus.MenuList>

        {activeModal && (
          <Modal.Window
            key={`${activeModal.windowName}-${rowData.idField}`}
            name={`${activeModal.windowName}-${rowData.idField}`}
            title={activeModal.windowName}
            description={activeModal.description}
            isUseOutsideClick={true}>
            {React.isValidElement(activeModal.action)
              ? React.createElement(activeModal.action.type, {
                  ...activeModal.action.props,
                  id: rowData.idField,
                  onCloseModal: () => setActiveModal(null),
                })
              : activeModal.action}
          </Modal.Window>
        )}
      </Menus.Menu>
    </Modal>
  );
}
