"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

export default function CloseButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-md absolute top-4 right-4 inline-block h-8 rounded-xs text-neutral-950 opacity-70 transition-all duration-300 hover:opacity-100 disabled:pointer-events-none has-[>svg]:px-0.5 hover:[&_svg]:stroke-2">
      <XMarkIcon className="size-4" />
    </button>
  );
}
