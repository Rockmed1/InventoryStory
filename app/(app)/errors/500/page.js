"use client";

import { redirect, useRouter } from "next/navigation";

//error boundaries have to always be client components

export default function Error500() {
  const router = useRouter();

  return (
    <main className="flex h-full flex-col items-center justify-center gap-6">
      <h1 className="text-xl font-semibold">Something went wrong!</h1>
      <p className="text-lg">⚠️ Internal server error. Contact support.</p>

      <button
        className="inline-block rounded-xl bg-neutral-200 p-2 text-lg text-neutral-800"
        onClick={() => redirect("/dashboard")}>
        Try again
      </button>
    </main>
  );
}
