function Input({ ...props }) {
  return (
    <input
      className="flex h-9 w-full min-w-0 rounded-md border border-neutral-200 px-3 py-1 shadow-xs transition-all outline-none selection:bg-neutral-400 focus-visible:border-neutral-500 focus-visible:ring-[3px] focus-visible:ring-neutral-500/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      {...props}
    />
  );
}

function Label({ htmlFor, children, ...props }) {
  return (
    <label
      className="flex items-center gap-2 text-sm leading-none font-[500] text-neutral-950 select-none"
      htmlFor={htmlFor}
      {...props}>
      {children}
    </label>
  );
}

function Description({ children }) {
  return <div className="-pt-1 text-sm text-neutral-500">{children}</div>;
}

function InputWithLabel({ name, description, children }) {
  return (
    <div className="grid w-full items-center gap-3">
      <Label htmlFor={name}>{children}</Label>
      <Input name={name} id={name} />
      <Description>{description}</Description>
    </div>
  );
}

function InputSelect({ children }) {
  return <div className="grid w-full items-center gap-3">{children}</div>;
}

function Footer({ children }) {
  return <div className="flex flex-row justify-end gap-2">{children}</div>;
}

export default function Form({ action, children }) {
  return (
    <form
      // onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-4"
      action={action}>
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
