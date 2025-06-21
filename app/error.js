'use client';
//error boundaries have to always be client components

export default function Error({ error, reset }) {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-6">
      <h1 className="text-xl font-semibold">Something went wrong!</h1>
      <p className="text-lg">{error.message}</p>

      <button
        className="bg-primary-200 text-primary-800 inline-block rounded-xl p-2 text-lg"
        onClick={reset}
      >
        Try again
      </button>
    </main>
  );
}
