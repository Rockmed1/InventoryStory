import React, { cloneElement } from "react";

/**
 * A container for grouping related content. Part of a compound component.
 * @param {React.ReactNode} children - The content of the card header.
 */
function CardHeader({ children }) {
  return (
    <div className="flex items-center justify-between px-6">{children}</div>
  );
}

/**
 * Displays the title for a Card. Part of a compound component.
 * @param {React.ReactNode} children - The title text.
 */
function CardTitle({ children }) {
  return <div className="text-lg font-semibold">{children}</div>;
}

/**
 * A container for action elements (like buttons or menus) in a Card. Part of a compound component.
 * @param {React.ReactNode} children - The action elements.
 */
function CardAction({ children }) {
  "use client";
  return <div>{children}</div>;
}

/**
 * The main content area of a Card. Part of a compound component.
 * @param {React.ReactNode} children - The main content.
 */
function CardContent({ children, ...props }) {
  return (
    <div className="px-4" {...props}>
      {children}
    </div>
  );
}

/**
 * A flexible and reusable card component for displaying content in a structured way.
 * Use as a compound component with `Card.Header`, `Card.Title`, `Card.Action`, and `Card.Content`.
 *
 * @param {React.ReactNode} children - The child components that make up the card.
 * @param {object} props - Any other props to pass to the underlying div element.
 */
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
