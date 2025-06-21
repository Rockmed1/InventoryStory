function Button({ children, disabled = false }) {
  return (
    <button
      disabled={disabled}
      className="text-primary-950 text-md disabled:text-primary-800 inline-block rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 tracking-wide transition-colors duration-300 hover:bg-neutral-200 focus:bg-neutral-200 focus:ring focus:ring-neutral-200 focus:ring-offset-2 active:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-400"
    >
      {children}
    </button>
  );
}

export default Button;
