import Link from "next/link";

function NotFound() {
  return (
    <main className="mt-4 space-y-6 text-center">
      <h1 className="text-3xl font-semibold">
        This page could not be found :(
      </h1>
      <Link
        href="/"
        className="inline-block rounded-xl bg-neutral-200 p-2 text-lg text-neutral-800">
        Go back home
      </Link>
    </main>
  );
}

export default NotFound;
