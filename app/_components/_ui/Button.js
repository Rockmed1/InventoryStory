import SpinnerMini from "./SpinnerMini";

/**
 * A versatile button component with different visual styles and states.
 *
 * @param {React.ReactNode} children - The content to display inside the button.
 * @param {boolean} [disabled=false] - Whether the button is disabled.
 * @param {'primary' | 'secondary' | 'danger' | 'menu' | 'cancel'} [type='secondary'] - The visual style of the button.
 * @param {Function} [onClick] - The function to call when the button is clicked.
 * @param {boolean} [pending=false] - If true, shows a spinner and disables the button.
 * @param {object} props - Any other props to pass to the underlying button element.
 */
function Button({
  children,
  disabled = false,
  type = "secondary",
  onClick,
  pending,
  ...props
}) {
  const sizes = {
    small: "text-xs px-2 py-1 uppercase font-semibold text-center",
    medium: "text-sm px-4 py-3 font-medium",
    full: "text-base px-6 py-3 font-medium",
  };

  const types = {
    primary:
      "border border-neutral-200 bg-white text-neutral-950  hover:bg-neutral-100 active:bg-neutral-200 disabled:bg-neutral-500 disabled:text-neutral-400 ",
    secondary:
      "border border-neutral-200 bg-white text-neutral-950  hover:bg-neutral-100 active:bg-neutral-200 disabled:bg-neutral-500 disabled:text-neutral-400 ",
    danger: "bg-red-500 hover:bg-red-600 text-white ",
    menu: "",
    cancel: "",
  };

  const buttonType = types[type];

  return (
    <button
      disabled={disabled || pending}
      onClick={onClick}
      className={`text-md inline-block h-8 rounded-md px-3 py-1 tracking-wide transition-colors duration-300 disabled:cursor-not-allowed has-[>svg]:px-2.5 [&_svg]:shrink-0 ${buttonType}`}
      {...props}>
      {pending && <SpinnerMini />}
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

/* 
// <tr data-slot="table-row" class="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80" data-state="false" data-dragging="false"><td data-slot="table-cell" class="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px]"><button data-slot="button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:text-accent-foreground dark:hover:bg-accent/50 text-muted-foreground size-7 hover:bg-transparent" role="button" tabindex="0" aria-disabled="false" aria-roledescription="sortable" aria-describedby="«R1q7neplb»"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-grip-vertical text-muted-foreground size-3"><path d="M9 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M9 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M9 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M15 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M15 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M15 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path></svg><span class="sr-only">Drag to reorder</span></button></td><td data-slot="table-cell" class="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px]"><div class="flex items-center justify-center"><button type="button" role="checkbox" aria-checked="false" data-state="unchecked" value="on" data-slot="checkbox" class="peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50" aria-label="Select row"></button></div></td><td data-slot="table-cell" class="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px]"><button data-slot="drawer-trigger" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive underline-offset-4 hover:underline h-9 py-2 has-[&gt;svg]:px-3 text-foreground w-fit px-0 text-left" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="radix-«Ropanq7neplb»" data-state="closed">Cover page</button></td><td data-slot="table-cell" class="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px]"><div class="w-32"><span data-slot="badge" class="inline-flex items-center justify-center rounded-md border py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&amp;]:hover:bg-accent [a&amp;]:hover:text-accent-foreground text-muted-foreground px-1.5">Cover page</span></div></td><td data-slot="table-cell" class="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px]"><span data-slot="badge" class="inline-flex items-center justify-center rounded-md border py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&amp;]:hover:bg-accent [a&amp;]:hover:text-accent-foreground text-muted-foreground px-1.5"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-loader "><path d="M12 6l0 -3"></path><path d="M16.25 7.75l2.15 -2.15"></path><path d="M18 12l3 0"></path><path d="M16.25 16.25l2.15 2.15"></path><path d="M12 18l0 3"></path><path d="M7.75 16.25l-2.15 2.15"></path><path d="M6 12l-3 0"></path><path d="M7.75 7.75l-2.15 -2.15"></path></svg>In Process</span></td><td data-slot="table-cell" class="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px]"><form><label data-slot="label" class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 sr-only" for="1-target">Target</label><input data-slot="input" class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent" id="1-target" value="18"></form></td><td data-slot="table-cell" class="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px]"><form><label data-slot="label" class="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 sr-only" for="1-limit">Limit</label><input data-slot="input" class="file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-input/30 focus-visible:bg-background dark:hover:bg-input/30 dark:focus-visible:bg-input/30 h-8 w-16 border-transparent bg-transparent text-right shadow-none focus-visible:border dark:bg-transparent" id="1-limit" value="5"></form></td><td data-slot="table-cell" class="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px]">Eddie Lake</td><td data-slot="table-cell" class="p-2 align-middle whitespace-nowrap [&amp;:has([role=checkbox])]:pr-0 [&amp;&gt;[role=checkbox]]:translate-y-[2px]"><button data-slot="dropdown-menu-trigger" class="items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg:not([class*='size-'])]:size-4 shrink-0 [&amp;_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 data-[state=open]:bg-muted text-muted-foreground flex size-8" type="button" id="radix-«R28panq7neplb»" aria-haspopup="menu" aria-expanded="false" data-state="closed"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="tabler-icon tabler-icon-dots-vertical "><path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path><path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"></path></svg><span class="sr-only">Open menu</span></button></td></tr> */
