"use client";

import { useOutsideClick } from "@/app/_hooks/useOutsideClick";
import React, { createContext, use, useState } from "react";
import { createPortal } from "react-dom";
import CloseButton from "./CloseButton";

function Overlay({ children }) {
  return (
    <div className="fixed top-0 left-0 z-[1000] flex h-lvh w-full items-center justify-center bg-black/50 transition-all duration-200">
      {children}
    </div>
  );
}

function StyledModal({ children, ref }) {
  return (
    <div
      ref={ref}
      className="fixed top-1/2 left-1/2 w-full max-w-[calc(100%-2rem)] -translate-1/2 rounded-xl border border-neutral-300 bg-white p-6 shadow-lg transition-all duration-200 sm:w-2xl">
      <div>{children}</div>
    </div>
  );
}

function Title({ children }) {
  return <p className="text-lg font-semibold">{children}</p>;
}

function Description({ children }) {
  return <p className="text-sm text-neutral-500">{children}</p>;
}

const ModalContext = createContext();

function Modal({ children }) {
  const [openName, setOpenName] = useState("");
  const close = () => setOpenName("");
  const open = setOpenName;

  return (
    <ModalContext.Provider value={{ openName, close, open }}>
      {children}
    </ModalContext.Provider>
  );
}

function Open({ children, opensWindowName }) {
  const { open } = use(ModalContext);
  // Fix: Use React.createElement instead of cloneElement to preserve context
  return React.createElement(children.type, {
    ...children.props,
    onClick: (e) => {
      children.props.onClick?.(e);
      open(opensWindowName);
    },
  });
}

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

  if (name !== openName) return null;

  return createPortal(
    <Overlay>
      <StyledModal ref={modalRef}>
        <CloseButton onClick={close} />
        <div className="flex w-full flex-col gap-4 sm:max-w-[600px]">
          <div className="flex flex-col gap-2">
            <Title>{title}</Title>
            <Description>{description}</Description>
          </div>
          {/* Fix: Use render prop pattern instead of cloneElement to preserve context */}
          {React.Children.count(children) > 0 && React.isValidElement(children)
            ? React.createElement(children.type, {
                ...children.props,
                onCloseModal: close,
              })
            : children}
        </div>
      </StyledModal>
    </Overlay>,
    document.body,
  );
}

Modal.Open = Open;
Modal.Window = Window;

export default Modal;
