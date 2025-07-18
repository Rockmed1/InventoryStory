"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

//error boundaries have to always be client components

export default function Error({ error, reset }) {
  const router = useRouter();
  const reload = () => {
    startTransition(() => {
      router.refresh(); // for server side we need to refresh
      reset(); //reset param is a function that resets the client only.
    });
  };

  return (
    <main className="flex h-full flex-col items-center justify-center gap-6">
      <h1 className="text-xl font-semibold">Something went wrong!</h1>
      <p className="text-lg">{error.message}</p>

      <button
        className="inline-block rounded-xl bg-neutral-200 p-2 text-lg text-neutral-800"
        onClick={() => reload()}>
        Try again
      </button>
    </main>
  );
}
