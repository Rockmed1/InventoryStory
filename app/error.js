"use client";
//error boundaries have to always be client components

export default function Error({ error, reset }) {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-6">
      <h1 className="text-xl font-semibold">Something went wrong!</h1>
      <p className="text-lg">{error.message}</p>

      <button
        className="inline-block rounded-xl bg-neutral-200 p-2 text-lg text-neutral-800"
        onClick={reset}>
        Try again
      </button>
    </main>
  );
}
