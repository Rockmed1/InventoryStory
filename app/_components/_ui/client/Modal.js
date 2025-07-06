"use client";

import { useOutsideClick } from "@/app/_hooks/useOutsideClick";
import React, { cloneElement, createContext, use, useState } from "react";
import { createPortal } from "react-dom";
import CloseButton from "../CloseButton";

function Overlay({ children }) {
  return (
    <div className="fixed top-0 left-0 z-[1000] flex h-lvh w-full items-center justify-center bg-black/50 transition-all duration-200">
      {/* // <div className="bg-backdrop fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm"> */}
      {children}
    </div>
  );
}

function StyledModal({ children, ref }) {
  return (
    <div
      ref={ref}
      className="fixed top-1/2 left-1/2 w-full max-w-[calc(100%-2rem)] -translate-1/2 rounded-xl border border-neutral-300 bg-white p-6 shadow-lg transition-all duration-200 sm:w-md">
      {/* <div
      ref={ref}
      className="relative z-50 mx-auto grid w-9/12 items-center justify-center rounded-xl bg-white p-2 shadow-xl"
    > */}
      <div>{children}</div>
    </div>
  );
}
// export default function Modal({ handleCloseModal, children }) {
// //: react portal is to place the modal outside the dom tree while maintaining its position in the component tree and still having access to all the props and everything as if it is still in the normal position:
//   //: the purpose of that could be to manage css overlap: example: we don't want css overflow hidden of the parent to apply to the modal
//   return createPortal(
//     <Overlay>
//       <StyledModal>
//         <Button onClick={handleCloseModal}>
//           <XMarkIcon className="size-5" />
//         </Button>
//         <div>{children}</div>
//       </StyledModal>
//     </Overlay>,
//     //: the second argument is for where we want to place it in the dom tree:
//     //: document.queryselector(...)
//     document.body,
//   );
// }

function Title({ children }) {
  return <p className="text-lg font-semibold">{children}</p>;
}

function Description({ children }) {
  return <p className="text-sm text-neutral-500">{children}</p>;
}

//:  to improve even further we should keep the isOpenModal state encapsulated inide the Modal component. to achieve this we use the compound component pattern.

//1- i-Create context
const ModalContext = createContext();

//2- Create the Parent Component
function Modal({ children }) {
  const [openName, setOpenName] = useState("");

  const close = () => setOpenName("");
  const open = setOpenName;

  //ii- return the context provider
  return (
    <ModalContext.Provider value={{ openName, close, open }}>
      {children}
    </ModalContext.Provider>
  );
}
//3- Create Children Components
/**
 * A button or element that opens a modal window. Must be a child of `Modal`.
 * It clones its child element to attach the necessary `onClick` handler.
 * @param {React.ReactNode} children - The trigger element (e.g., a Button).
 * @param {string} opensWindowName - The name of the `Modal.Window` to open.
 */
function Open({ children, opensWindowName }) {
  // iii-consume the context
  const { open } = use(ModalContext);
  return cloneElement(children, { onClick: () => open(opensWindowName) });
}

/**
 * The window content of the modal. Must be a child of `Modal`.
 * It is rendered into a React Portal at the end of `document.body`.
 * @param {string} name - The unique name of this window, which must match the `opensWindowName` of a `Modal.Open` component.
 * @param {string} [title] - The title to display at the top of the modal.
 * @param {string} [description] - A description to display below the title.
 * @param {boolean} [isUseOutsideClick=true] - Whether to enable closing the modal by clicking outside of it.
 * @param {React.ReactNode} children - The content of the modal window.
 */
function Window({
  name,
  title,
  description,
  isUseOutsideClick = true,
  children,
}) {
  const { openName, close } = use(ModalContext);

  let modalRef;
  if (isUseOutsideClick) {
    modalRef = useOutsideClick(close);
  }

  // const modalRef = useRef(null);
  // useEffect(() => {
  //   function handleClick(e) {
  //     console.log(modalRef.current);
  //     console.log(e.target);
  //     if (modalRef.current && !modalRef.current.contains(e.target)) {
  //       // console.log(e.target);
  //       console.log('click outside modal window');
  //       close();
  //     }
  //   }

  //   document.addEventListener('click', handleClick, true);

  //   return () => document.removeEventListener('click', handleClick, true);
  // }, [close]);

  if (name !== openName) return null;

  return createPortal(
    <Overlay>
      <StyledModal ref={modalRef}>
        {/* <Button onClick={close} className="absolute top-4 right-4">
          <XMarkIcon className="size-5" />
        </Button> */}
        <CloseButton onClick={close} />

        <div className="flex w-full flex-col gap-4 sm:max-w-[425px]">
          <div className="flex flex-col gap-2">
            <Title>{title}</Title>
            <Description>{description}</Description>
          </div>
          {/* {children} */}
          {/* {cloneElement(children, { onCloseModal: close })} // this will error out if passing [null or undefined, Arrays of elements, Plain text/strings, Numbers, Multiple elements] as children*/}
          {React.Children.count(children) > 0 && React.isValidElement(children)
            ? cloneElement(children, { onCloseModal: close })
            : children}
        </div>
      </StyledModal>
    </Overlay>,
    document.body,
  );
}

//4- Add the properties to the parent function
Modal.Open = Open;
// Modal.Title = Title;
// Modal.Description = Description;
Modal.Window = Window;

export default Modal;

// "use client";

// import AddButtonModal from "../_ui/client/AddButtonModal";

// //* this is OK but not ideal because isOpenModal state is unnecessarily managed by the AddCabin component ...
// // export default function AddItem() {
// //   const [openModal, setOpenModal] = useState(false);

// //   function handleOpenModal() {
// //     setOpenModal(open => !open);
// //   }

// //   return (
// //     <div>
// //       <Button onClick={handleOpenModal}>
// //         <div className="flex items-center justify-between gap-1">
// //           <PlusIcon className="size-4" /> {'  '}
// //           <span>Add item</span>
// //         </div>
// //       </Button>
// //       {openModal && (
// //         <Modal handleCloseModal={() => setOpenModal(false)}>
// //           <p>This is Modal</p>
// //           <Button type="cancel" onClick={() => setOpenModal(false)}>
// //             Cancel
// //           </Button>
// //         </Modal>
// //       )}
// //     </div>
// //   );
// // }

// //* applying the Compound Component Pattern to encapsulate the Modal Logic and state
// export default function AddItem() {
//   return (
//     <div>
//       <AddButtonModal opensWindowName="item-form" buttonLabel="Add item">
//         This is a modal for the item form.
//       </AddButtonModal>
//       {/* <Modal>
//         <Modal.Open opensWindowName="item-form">
//           <Button>
//             <div className="flex items-center justify-between gap-1">
//               <PlusIcon className="size-4" />
//               <span>Add item</span>
//             </div>
//           </Button>
//         </Modal.Open>
//         <Modal.Window name="item-form">
//           This is a modal for the item form.
//         </Modal.Window>

//         <Modal.Open opensWindowName="confirm-delete">
//           <Button>
//             <div className="flex items-center justify-between gap-1">
//               <MinusIcon className="size-4" />
//               <span>Delete item</span>
//             </div>
//           </Button>
//         </Modal.Open>
//         <Modal.Window name="confirm-delete">
//           <ConfirmDelete
//             resourceName="item"
//             onConfirm={() => {
//               alert("delete confirmed");
//             }}
//           />
//         </Modal.Window>
//       </Modal> */}
//     </div>
//   );
// }
