"use client";

import React, { useState } from "react";
import Menus from "./Menus";
import Modal from "./Modal";

export default function MenuWithModal({ rowData, rowActions }) {
  // const rowActions = [
  //   {
  //     buttonLabel: "Edit",
  //     windowName: "Edit Item",
  //     icon: <PencilIcon />,
  //     action: "" /* here goes the form component */,
  //   },
  // ];
  const [activeModal, setActiveModal] = useState(null);

  // the parent container has to wrap
  //     <Menus>
  return (
    <Modal>
      <Menus.Menu>
        <Menus.MenuToggle id={rowData.id} />
        <Menus.MenuList id={rowData.id}>
          {/* loop over the action list */}
          {rowActions.map((rowAction) => (
            <Modal.Open
              key={`${rowAction.windowName}-${rowData.id}`}
              opensWindowName={`${rowAction.windowName}-${rowData.id}`}>
              <Menus.MenuButton onClick={() => setActiveModal(rowAction)}>
                <div className="flex items-center justify-between gap-3">
                  {rowAction.icon}
                  <span>{rowAction.buttonLabel}</span>
                </div>
              </Menus.MenuButton>
            </Modal.Open>
          ))}
        </Menus.MenuList>

        {/* only render one (active) modal window */}
        {activeModal && (
          <Modal.Window
            key={`${activeModal.windowName}-${rowData.id}`}
            name={`${activeModal.windowName}-${rowData.id}`}
            title={activeModal.windowName}
            description={activeModal.description}
            isUseOutsideClick={false}>
            {/* Edit Form component goes here. cloneElement is used to pass the row data as a prop */}
            {React.isValidElement(activeModal.action)
              ? React.cloneElement(activeModal.action, {
                  id: rowData.id,
                  onCloseModal: () => setActiveModal(null),
                })
              : /* or just a server action function as needed*/
                activeModal.action}
          </Modal.Window>
        )}
      </Menus.Menu>
    </Modal>
  );
}

// <Menus.Menu>
//   <Menus.MenuToggle id={row.id} />
//   <Menus.MenuList id={row.id}>
//     {rowActions.map((rowAction) => (
//       <Menus.MenuButton key={rowAction.id} onClick={() => rowAction.action?.()}>
//         {rowAction.icon && rowAction.icon}
//         <span>{rowAction.label}</span>
//       </Menus.MenuButton>
//     ))}
//   </Menus.MenuList>
// </Menus.Menu>;
