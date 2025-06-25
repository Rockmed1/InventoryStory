function Button({ children, disabled = false, type, onClick, ...props }) {
  const sizes = {
    small: "text-xs px-2 py-1 uppercase font-semibold text-center",
    medium: "text-sm px-4 py-3 font-medium",
    large: "text-base px-6 py-3 font-medium",
  };

  const types = {
    primary: "text-brand-50 bg-brand-600 hover:bg-brand-700",
    secondary: "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50",
    danger: "text-red-100 bg-red-700 hover:bg-red-800",
    menu: "",
  };

  const buttonType = types[type];

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="text-primary-950 text-md disabled:text-primary-400 active:bg-primary-200 disabled:bg-primary-500 inline-block rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 tracking-wide transition-colors duration-300 hover:bg-neutral-100 disabled:cursor-not-allowed">
      {children}
    </button>
  );
}

export default Button;

// const sizes = {
//   small: "text-xs px-2 py-1 uppercase font-semibold text-center",
//   medium: "text-sm px-4 py-3 font-medium",
//   large: "text-base px-6 py-3 font-medium",
// };

// const variations = {
//   primary: "text-brand-50 bg-brand-600 hover:bg-brand-700",
//   secondary: "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50",
//   danger: "text-red-100 bg-red-700 hover:bg-red-800",

// };

// export default function Button({
//   children,
//   size = "medium",
//   variation = "primary",
//   className = "",
//   ...props
// }) {
//   const sizeClasses = sizes[size];
//   const variationClasses = variations[variation];

//   return (
//     <button
//       className={`
//         border-none rounded-sm shadow-sm
//         ${sizeClasses}
//         ${variationClasses}
//         ${className}
//       `.trim().replace(/\s+/g, ' ')}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// }
