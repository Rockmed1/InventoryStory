import React from "react";

function CardHeader({ children }) {
  return (
    <div className="flex items-center justify-between px-6">{children}</div>
  );
}

function CardTitle({ children }) {
  return <div className="text-lg font-semibold">{children}</div>;
}

function CardAction({ children }) {
  "use client";
  return <div>{children}</div>;
}

function CardContent({ children, ...props }) {
  return (
    <div className="px-4" {...props}>
      {children}
    </div>
  );
}

function Card({ children, ...props }) {
  return (
    <div className="flex w-full flex-col gap-4 overflow-scroll rounded-xl border border-neutral-200 bg-white py-4 shadow-xs">
      {/* {cloneElement(children, { onCloseModal: close })} // this will error out if passing [null or undefined, Arrays of elements, Plain text/strings, Numbers, Multiple elements] as children*/}
      {React.Children.count(children) > 0 && React.isValidElement(children)
        ? cloneElement(children, { ...props })
        : children}
    </div>
  );
}

Card.CardHeader = CardHeader;
Card.CardTitle = CardTitle;
Card.CardAction = CardAction;
Card.CardContent = CardContent;

export default Card;
