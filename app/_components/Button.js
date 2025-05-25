function Button({ children, disabled = false }) {
  return (
    <button
      disabled={disabled}
      className="inline-block rounded-md bg-blue-500 px-2 py-1 font-semibold tracking-wide text-slate-50 transition-colors duration-300 hover:bg-blue-400 focus:bg-blue-600 focus:ring focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {children}
    </button>
  );
}

export default Button;
