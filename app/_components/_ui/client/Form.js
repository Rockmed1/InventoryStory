"use client";

import { cn } from "@/app/_utils/utils";
import { useEffect, useState } from "react";

/**
 * A styled input element. Part of the Form compound component.
 * @param {object} props - Any props to pass to the underlying input element.
 */
export function Input({
  inputValue,
  placeholder,
  className,
  onChange,
  ...props
}) {
  const [value, setValue] = useState(inputValue || "");

  useEffect(() => {
    if (inputValue !== undefined) {
      setValue(inputValue);
    }
  }, [inputValue]);

  console.log("input render");
  return (
    <div className="">
      <input
        className={cn(
          `flex h-9 w-full min-w-0 rounded-md border border-neutral-200 px-3 py-1 shadow-xs transition-all outline-none selection:bg-neutral-400 focus-visible:border-neutral-500 focus-visible:ring-[3px] focus-visible:ring-neutral-500/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`,
          className,
        )}
        placeholder={placeholder}
        value={value}
        onChange={onChange || ((e) => setValue(e.target.value))}
        type="search"
        {...props}
        // onChange={(e) => setValue(e.currentTarget.value)}
      />
    </div>
  );
}

/**
 * A styled label element. Part of the Form compound component.
 * @param {string} htmlFor - The ID of the input element this label is for.
 * @param {React.ReactNode} children - The content of the label.
 */
export function Label({ htmlFor, children, ...props }) {
  console.log("label render");
  return (
    <label
      className="flex items-center gap-2 text-sm leading-none font-[500] text-neutral-950 select-none"
      htmlFor={htmlFor}
      {...props}>
      {children}
    </label>
  );
}

/**
 * A styled description element to provide help text for a form field. Part of the Form compound component.
 * @param {React.ReactNode} children - The description text.
 */
function Description({ children }) {
  return <div className="-pt-1 text-sm text-neutral-500">{children}</div>;
}

function ZodErrors({ error }) {
  if (!error) return null;
  return <div className="-pt-1 text-sm text-red-400">{error}</div>;
}

/**
 * A convenient wrapper that combines a Label, Input, and Description. Part of the Form compound component.
 * @param {string} name - The name and ID for the input element.
 * @param {string} [description] - Optional help text to display below the input.
 * @param {React.ReactNode} children - The label text.
 */
function InputWithLabel({
  name,
  description,
  inputValue,
  error,
  children,
  placeholder,
  ...props
}) {
  return (
    <div className="grid w-full items-center gap-2.5">
      <Label htmlFor={name}>{children}</Label>
      <Input
        placeholder={placeholder}
        inputValue={inputValue}
        name={name}
        id={name}
        {...props}
      />
      <ZodErrors error={error} />
    </div>
  );
}

/**
 * A wrapper for select inputs within the form. Part of the Form compound component.
 * @param {React.ReactNode} children - The select component and its label.
 */
function InputSelect({ children, error }) {
  return (
    <div className="grid w-full items-center gap-2.5">
      {children}
      <ZodErrors error={error} />
    </div>
  );
}

/**
 * A footer container for form actions (e.g., submit and cancel buttons). Part of the Form compound component.
 * @param {React.ReactNode} children - The action buttons.
 */
function Footer({ children }) {
  return <div className="flex flex-row justify-end gap-2">{children}</div>;
}

/**
 * A compound component for building forms.
 * Provides a structured way to create forms with consistent styling.
 * Use with `Form.Input`, `Form.Label`, `Form.InputWithLabel`, etc.
 *
 * @param {Function} action - The server action to be executed on form submission.
 * @param {React.ReactNode} children - The content of the form.
 */
export default function Form({ action, onSubmit, children }) {
  console.log("form render");
  return (
    <form
      // onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-4.5"
      action={action}
      onSubmit={onSubmit}>
      {children}
    </form>
  );
}

Form.Input = Input;
Form.Label = Label;
Form.Description = Description;
Form.InputWithLabel = InputWithLabel;
Form.InputSelect = InputSelect;
Form.Footer = Footer;
Form.ZodErrors = ZodErrors;
