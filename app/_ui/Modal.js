import { useOutsideClick } from "@/app/hooks/useOutsideClick";
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { cloneElement, createContext, use, useState } from "react";
import { createPortal } from "react-dom";
import Button from "../_ui/Button";

function Overlay({ children }) {
  return (
    <div className="bg-backdrop fixed top-0 left-0 z-[1000] flex h-lvh w-full items-center justify-center backdrop-blur-xs transition-all duration-200">
      {/* // <div className="bg-backdrop fixed inset-0 flex items-center justify-center p-4 backdrop-blur-sm"> */}
      {children}
    </div>
  );
}

function StyledModal({ children, ref }) {
  return (
    <div
      ref={ref}
      className="border-primary-300 fixed top-1/2 left-1/2 -translate-1/2 rounded-xl border bg-neutral-50 p-4 shadow-lg transition-all duration-200">
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
function Open({ children, opensWindowName }) {
  // iii-consume the context
  const { open } = use(ModalContext);

  return cloneElement(children, { onClick: () => open(opensWindowName) });
}

function Window({ name, children }) {
  const { openName, close } = use(ModalContext);

  const modalRef = useOutsideClick(close);

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
        <Button onClick={close}>
          <XMarkIcon className="size-5" />
        </Button>
        <div>
          {/* {children} */}
          {/* {cloneElement(children, { onCloseModal: close })} // this will error out if passing [null or undefined, Arrays of elements, Plain text/strings, Numbers, Multiple elements] as children*/}
          {React.Children.count(children) === 1 &&
          React.isValidElement(children)
            ? cloneElement(children, { onCloseModal: close })
            : children}
        </div>
        {/* <div>{children}</div> */}
      </StyledModal>
    </Overlay>,

    document.body,
  );
}

//4- Add the properties to the parent function
Modal.Open = Open;
Modal.Window = Window;

export default Modal;
